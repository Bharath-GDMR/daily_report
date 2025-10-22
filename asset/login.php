<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

try {
    // Get the posted data
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $users = include('users.php');

    $response = ['success' => false, 'message' => 'Invalid username or password.'];

    if (isset($users[$username])) {
        // Check if password_verify function exists
        if (!function_exists('password_verify')) {
            throw new Exception('Server configuration error: password_verify function not found. Please use PHP version 5.5 or newer.');
        }

        if (password_verify($password, $users[$username]['hash'])) {
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $username;
            session_write_close(); // Explicitly save the session
            $response = ['success' => true];
        }
    }
} catch (Throwable $e) {
    // Catch any error (PHP 7+) and report it
    http_response_code(500);
    $response = ['success' => false, 'message' => 'Server Error: ' . $e->getMessage() . ' in ' . basename($e->getFile()) . ' on line ' . $e->getLine()];
}

header('Content-Type: application/json');
echo json_encode($response);
?>