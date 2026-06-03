param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$CppHost = "localhost",
    [int]$CppPort = 8080,
    [switch]$RequireCpp
)

$ErrorActionPreference = "Stop"

function Assert-Status {
    param(
        [string]$Name,
        [object]$Response,
        [int]$Expected
    )

    if ([int]$Response.StatusCode -ne $Expected) {
        Write-Host "[FAIL] $Name" -ForegroundColor Red
        Write-Host "Expected status: $Expected"
        Write-Host "Actual status:   $($Response.StatusCode)"
        Write-Host "Body:"
        Write-Host $Response.Content
        exit 1
    }

    Write-Host "[OK] $Name -> $Expected" -ForegroundColor Green
}

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session = $null,
        [hashtable]$Headers = @{}
    )

    $uri = "$BaseUrl$Path"
    $json = $null

    $args = @{
        Method          = $Method
        Uri             = $uri
        ErrorAction     = "Stop"
        UseBasicParsing = $true
    }

    if ($Session) {
        $args.WebSession = $Session
    }

    if ($Headers.Count -gt 0) {
        $args.Headers = $Headers
    }

    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Compress
        $args.ContentType = "application/json"
        $args.Body = $json
    }

    try {
        return Invoke-WebRequest @args
    } catch {
        if ($_.Exception.Response) {
            return $_.Exception.Response
        }
        throw
    }
}

function Read-Json {
    param([object]$Response)

    if (-not $Response.Content) {
        return $null
    }

    return $Response.Content | ConvertFrom-Json
}

function Send-CppCommand {
    param([string]$Command)

    $client = [System.Net.Sockets.TcpClient]::new()
    $client.Connect($CppHost, $CppPort)

    try {
        $stream = $client.GetStream()
        $stream.ReadTimeout = 3000

        $bytes = [System.Text.Encoding]::UTF8.GetBytes("$Command`n")
        $stream.Write($bytes, 0, $bytes.Length)

        $buffer = New-Object byte[] 4096
        $count = $stream.Read($buffer, 0, $buffer.Length)
        return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $count).Trim()
    } finally {
        $client.Close()
    }
}

function Test-TcpPort {
    param(
        [string]$HostName,
        [int]$Port
    )

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $result = $client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $result.AsyncWaitHandle.WaitOne(1000)) {
            return $false
        }

        $client.EndConnect($result)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

$runId = [guid]::NewGuid().ToString("N").Substring(0, 8)
$cppAvailable = Test-TcpPort $CppHost $CppPort

Write-Host "Testing web API at $BaseUrl" -ForegroundColor Cyan
Write-Host "Testing C++ TCP service at ${CppHost}:${CppPort}" -ForegroundColor Cyan

if (-not $cppAvailable) {
    $message = "C++ TCP service is not reachable at ${CppHost}:${CppPort}."
    if ($RequireCpp) {
        Write-Host "[FAIL] $message Start docker compose or the C++ server, then rerun." -ForegroundColor Red
        exit 1
    }

    Write-Host "[SKIP] $message Recommendation checks will be skipped." -ForegroundColor Yellow
}

# Assignment user routes:
# POST /api/users creates a user.
# GET /api/users/:id returns that user's details.
$register = Invoke-Api POST "/api/users" @{
    username = "alice_$runId"
    password = "secret"
    name     = "Alice"
    address  = "1 Main St"
}
Assert-Status "POST /api/users creates a user" $register 201
$user = Read-Json $register
$userId = $user.id
if (-not $userId) {
    Write-Host "[FAIL] created user response did not include id" -ForegroundColor Red
    exit 1
}
if ($user.password -or $user.passwordHash -or $user.passwordSalt) {
    Write-Host "[FAIL] created user leaked password fields" -ForegroundColor Red
    exit 1
}

$missingPassword = Invoke-Api POST "/api/users" @{
    username = "missing_password_$runId"
}
Assert-Status "POST /api/users requires password" $missingPassword 400

$duplicate = Invoke-Api POST "/api/users" @{
    username = "alice_$runId"
    password = "secret"
}
Assert-Status "POST /api/users rejects duplicate username" $duplicate 409

# Assignment login route:
# POST /api/tokens validates credentials and returns the connected user id.
$login = Invoke-Api POST "/api/tokens" @{
    username = "alice_$runId"
    password = "secret"
}
Assert-Status "POST /api/tokens logs in" $login 200
$loginJson = Read-Json $login
if ($loginJson.userId -ne $userId) {
    Write-Host "[FAIL] login response did not include the created user id" -ForegroundColor Red
    exit 1
}
if ($loginJson.token) {
    Write-Host "[FAIL] login response should not include a token in the current ex3 flow" -ForegroundColor Red
    exit 1
}

$badLogin = Invoke-Api POST "/api/tokens" @{
    username = "alice_$runId"
    password = "wrong"
}
Assert-Status "POST /api/tokens rejects bad password" $badLogin 404

$missingLoginUsername = Invoke-Api POST "/api/tokens" @{
    password = "secret"
}
Assert-Status "POST /api/tokens requires username" $missingLoginUsername 400

$missingLoginPassword = Invoke-Api POST "/api/tokens" @{
    username = "alice_$runId"
}
Assert-Status "POST /api/tokens requires password" $missingLoginPassword 400

$aliceHeaders = @{ "user-id" = $userId }

$ownProfile = Invoke-Api GET "/api/users/$userId" $null $null $aliceHeaders
Assert-Status "GET /api/users/:id returns details with user-id header" $ownProfile 200
$ownProfileJson = Read-Json $ownProfile
if ($ownProfileJson.id -ne $userId) {
    Write-Host "[FAIL] own profile returned wrong id" -ForegroundColor Red
    exit 1
}
if ($ownProfileJson.password -or $ownProfileJson.passwordHash -or $ownProfileJson.passwordSalt) {
    Write-Host "[FAIL] own profile leaked password fields" -ForegroundColor Red
    exit 1
}

$unauthProfile = Invoke-Api GET "/api/users/$userId"
Assert-Status "GET /api/users/:id without user-id header is blocked" $unauthProfile 401

$missingProfile = Invoke-Api GET "/api/users/missing-user-$runId" $null $null $aliceHeaders
Assert-Status "GET /api/users/:id returns 404 for unknown user" $missingProfile 404

$other = Invoke-Api POST "/api/users" @{
    username = "bob_$runId"
    password = "secret"
    name     = "Bob"
}
Assert-Status "POST /api/users creates second user" $other 201
$otherId = (Read-Json $other).id

$bobLogin = Invoke-Api POST "/api/tokens" @{
    username = "bob_$runId"
    password = "secret"
}
Assert-Status "POST /api/tokens logs in second user" $bobLogin 200

$bobHeaders = @{ "user-id" = $otherId }
$profileWithOtherHeader = Invoke-Api GET "/api/users/$userId" $null $null $bobHeaders
Assert-Status "GET /api/users/:id accepts any connected user-id header in current ex3 flow" $profileWithOtherHeader 200

$viewRoute = Invoke-Api POST "/api/users/$userId/views" @{
    productId = "p1"
} $null $aliceHeaders
Assert-Status "POST /api/users/:id/views is not exposed" $viewRoute 404

# Restaurant and product routes from the menu API.
$missingRestaurantName = Invoke-Api POST "/api/restaurants" @{}
Assert-Status "POST /api/restaurants requires name" $missingRestaurantName 400

$restaurant = Invoke-Api POST "/api/restaurants" @{
    name = "Restaurant_$runId"
}
Assert-Status "POST /api/restaurants creates a restaurant" $restaurant 201
$restaurantLocation = $restaurant.Headers["Location"]
$restaurantId = ($restaurantLocation -split "/")[-1]

$getRestaurant = Invoke-Api GET "/api/restaurants/$restaurantId"
Assert-Status "GET /api/restaurants/:id returns restaurant" $getRestaurant 200

$missingRestaurant = Invoke-Api GET "/api/restaurants/missing-restaurant-$runId"
Assert-Status "GET /api/restaurants/:id returns 404 for missing restaurant" $missingRestaurant 404

$allRestaurants = Invoke-Api GET "/api/restaurants"
Assert-Status "GET /api/restaurants lists restaurants" $allRestaurants 200

$invalidRestaurantPatch = Invoke-Api PATCH "/api/restaurants/$restaurantId" @{}
Assert-Status "PATCH /api/restaurants/:id requires name" $invalidRestaurantPatch 400

$missingRestaurantPatch = Invoke-Api PATCH "/api/restaurants/missing-restaurant-$runId" @{
    name = "UpdatedMissingRestaurant_$runId"
}
Assert-Status "PATCH /api/restaurants/:id returns 404 for missing restaurant" $missingRestaurantPatch 404

$updateRestaurant = Invoke-Api PATCH "/api/restaurants/$restaurantId" @{
    name = "UpdatedRestaurant_$runId"
}
Assert-Status "PATCH /api/restaurants/:id updates restaurant" $updateRestaurant 200

$missingProductName = Invoke-Api POST "/api/restaurants/$restaurantId/products" @{}
Assert-Status "POST /api/restaurants/:id/products requires name" $missingProductName 400

$missingRestaurantProduct = Invoke-Api POST "/api/restaurants/missing-restaurant-$runId/products" @{
    name = "PizzaMissingRestaurant_$runId"
}
Assert-Status "POST /api/restaurants/:id/products returns 404 for missing restaurant" $missingRestaurantProduct 404

$product = Invoke-Api POST "/api/restaurants/$restaurantId/products" @{
    name = "Pizza_$runId"
}
Assert-Status "POST /api/restaurants/:id/products creates product" $product 201
$productLocation = $product.Headers["Location"]
$productId = ($productLocation -split "/")[-1]

$getProduct = Invoke-Api GET "/api/restaurants/$restaurantId/products/$productId"
Assert-Status "GET /api/restaurants/:id/products/:pId returns product" $getProduct 200

$missingProduct = Invoke-Api GET "/api/restaurants/$restaurantId/products/missing-product-$runId"
Assert-Status "GET /api/restaurants/:id/products/:pId returns 404 for missing product" $missingProduct 404

$missingRestaurantProductGet = Invoke-Api GET "/api/restaurants/missing-restaurant-$runId/products/$productId"
Assert-Status "GET /api/restaurants/:id/products/:pId returns 404 for missing restaurant" $missingRestaurantProductGet 404

$allProducts = Invoke-Api GET "/api/restaurants/$restaurantId/products"
Assert-Status "GET /api/restaurants/:id/products lists products" $allProducts 200

$invalidProductPatch = Invoke-Api PATCH "/api/restaurants/$restaurantId/products/$productId" @{}
Assert-Status "PATCH /api/restaurants/:id/products/:pId requires name" $invalidProductPatch 400

$missingProductPatch = Invoke-Api PATCH "/api/restaurants/$restaurantId/products/missing-product-$runId" @{
    name = "UpdatedMissingPizza_$runId"
}
Assert-Status "PATCH /api/restaurants/:id/products/:pId returns 404 for missing product" $missingProductPatch 404

$missingRestaurantProductPatch = Invoke-Api PATCH "/api/restaurants/missing-restaurant-$runId/products/$productId" @{
    name = "UpdatedMissingRestaurantPizza_$runId"
}
Assert-Status "PATCH /api/restaurants/:id/products/:pId returns 404 for missing restaurant" $missingRestaurantProductPatch 404

$updateProduct = Invoke-Api PATCH "/api/restaurants/$restaurantId/products/$productId" @{
    name = "UpdatedPizza_$runId"
}
Assert-Status "PATCH /api/restaurants/:id/products/:pId updates product" $updateProduct 204

# Recommendation route. It requires the user-id header in the current ex3 flow.
# The C++ server must already be running on $CppHost:$CppPort.
if ($cppAvailable) {
    $trackedProduct = Invoke-Api GET "/api/restaurants/$restaurantId/products/$productId" $null $null $aliceHeaders
    Assert-Status "GET /api/restaurants/:id/products/:pId tracks authenticated view" $trackedProduct 200

    $cppUser = Send-CppCommand "PATCH $userId rec-base-$runId rec-owned-$runId"
    Write-Host "[INFO] C++ seed current user -> $cppUser"

    $neighbor = Send-CppCommand "POST neighbor-$runId rec-base-$runId rec-suggestion-a-$runId rec-suggestion-b-$runId"
    Write-Host "[INFO] C++ seed neighbor -> $neighbor"

    $recommendations = Invoke-Api GET "/api/users/$userId/recommendations?productId=rec-base-$runId" $null $null $aliceHeaders
    Assert-Status "GET /api/users/:id/recommendations returns recommendations with user-id header" $recommendations 200
    $recommendationsJson = Read-Json $recommendations
    if (-not ($recommendationsJson.recommendations -match "rec-suggestion")) {
        Write-Host "[FAIL] recommendations response did not include seeded suggestions" -ForegroundColor Red
        Write-Host $recommendations.Content
        exit 1
    }

    $recommendationsNoHeader = Invoke-Api GET "/api/users/$userId/recommendations?productId=rec-base-$runId"
    Assert-Status "GET /api/users/:id/recommendations without user-id header is blocked" $recommendationsNoHeader 401

    $recommendationsMissingProductId = Invoke-Api GET "/api/users/$userId/recommendations" $null $null $aliceHeaders
    Assert-Status "GET /api/users/:id/recommendations requires productId" $recommendationsMissingProductId 400

    $recommendationsMissingUser = Invoke-Api GET "/api/users/missing-user-$runId/recommendations?productId=rec-base-$runId" $null $null $aliceHeaders
    Assert-Status "GET /api/users/:id/recommendations returns 404 for missing user" $recommendationsMissingUser 404
}

$missingProductDelete = Invoke-Api DELETE "/api/restaurants/$restaurantId/products/missing-product-$runId"
Assert-Status "DELETE /api/restaurants/:id/products/:pId returns 404 for missing product" $missingProductDelete 404

$missingRestaurantProductDelete = Invoke-Api DELETE "/api/restaurants/missing-restaurant-$runId/products/$productId"
Assert-Status "DELETE /api/restaurants/:id/products/:pId returns 404 for missing restaurant" $missingRestaurantProductDelete 404

$deleteProduct = Invoke-Api DELETE "/api/restaurants/$restaurantId/products/$productId"
Assert-Status "DELETE /api/restaurants/:id/products/:pId deletes product" $deleteProduct 204

$missingRestaurantDelete = Invoke-Api DELETE "/api/restaurants/missing-restaurant-$runId"
Assert-Status "DELETE /api/restaurants/:id returns 404 for missing restaurant" $missingRestaurantDelete 404

$deleteRestaurant = Invoke-Api DELETE "/api/restaurants/$restaurantId"
Assert-Status "DELETE /api/restaurants/:id deletes restaurant" $deleteRestaurant 204

Write-Host "All API checks passed." -ForegroundColor Green
