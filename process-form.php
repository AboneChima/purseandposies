<?php
// PayPal configuration 
define('PAYPAL_CLIENT_ID', 'ARY7sEkNNDGNFRepJ4LPchGto08sS2hCzO2UolMw6MHVcfaBwrZsOTIuWbVfBFecEo5KnH0oKSIU8mwk');
define('PAYPAL_CLIENT_SECRET', 'EgoiCBFjdPsoMp8A0JQpzchslbYEwXqM9vm4wy6lrDarY-1V0ZFEsflWGXdD5NdCbDvKlfrx8NONNf29');
define('PAYPAL_CURRENCY', 'USD');
define('PAYPAL_MODE', 'sandbox'); // sandbox or live


$paypal_url = (PAYPAL_MODE == 'sandbox') 
    ? 'https://api-m.sandbox.paypal.com' 
    : 'https://api-m.paypal.com';


function createPayPalOrder($amount, $currency = PAYPAL_CURRENCY) {
    global $paypal_url;
    
   
    $access_token = getPayPalAccessToken();
    
    $data = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'amount' => [
                'currency_code' => $currency,
                'value' => number_format($amount, 2, '.', '')
            ]
        ]]
    ];
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $paypal_url . '/v2/checkout/orders',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token
        ]
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    return $err ? $err : json_decode($response, true);
}


function capturePayPalPayment($orderID) {
    global $paypal_url;
    
    $access_token = getPayPalAccessToken();
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $paypal_url . "/v2/checkout/orders/$orderID/capture",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $access_token
        ]
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    return $err ? $err : json_decode($response, true);
}


function getPayPalAccessToken() {
    global $paypal_url;
    
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => $paypal_url . '/v1/oauth2/token',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_USERPWD => PAYPAL_CLIENT_ID . ':' . PAYPAL_CLIENT_SECRET,
        CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded']
    ]);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if ($err) {
        return $err;
    }
    
    $result = json_decode($response, true);
    return $result['access_token'];
}

// Process the payment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['create_order'])) {
        // Create order
        $amount = $_POST['amount'];
        $result = createPayPalOrder($amount);
        echo json_encode($result);
        exit;
    } 
    elseif (isset($_POST['capture_order'])) {
        // Capture payment
        $orderID = $_POST['orderID'];
        $result = capturePayPalPayment($orderID);
        
        if (isset($result['status']) && $result['status'] === 'COMPLETED') {
            // Payment successful - update your database here
            echo json_encode(['success' => true, 'message' => 'Payment completed successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Payment failed']);
        }
        exit;
    }
}
?>