<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// --- File Upload Configuration ---
$max_file_size = 10 * 1024 * 1024; // 10 MB

// --- Get data from the form ---
$recipient = $_POST['to'] ?? '';
$subject = $_POST['subject'] ?? 'No Subject';
$message_body = $_POST['message'] ?? 'No Message Content';

// --- Basic Validation ---
if (empty($recipient) || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing recipient email.']);
    exit;
}

// --- Attachment Handling ---
$attachment_content = null;
$attachment_name = null;
$attachment_type = null;

if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] == UPLOAD_ERR_OK) {
    // Check file size
    if ($_FILES['attachment']['size'] > $max_file_size) {
        http_response_code(413); // Payload Too Large
        echo json_encode(['success' => false, 'message' => 'File is too large. Maximum size is 10MB.']);
        exit;
    }

    $attachment_path = $_FILES['attachment']['tmp_name'];
    $attachment_name = $_FILES['attachment']['name'];
    $attachment_type = $_FILES['attachment']['type'];
    $attachment_content = chunk_split(base64_encode(file_get_contents($attachment_path)));
}

// --- Email Configuration ---
$from_address = 'bharath@vmsd.in';
$boundary = md5(time());

// --- Construct Headers ---
$headers = [
    'MIME-Version: 1.0',
    'From: GDMR Office Hub <' . $from_address . '>',
    'Reply-To: ' . $from_address,
    'X-Mailer: PHP/' . phpversion()
];

// --- Construct Body ---
if ($attachment_content) {
    // Multipart message for attachment
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $body = '--' . $boundary . "\r\n";
    $body .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
    $body .= 'Content-Transfer-Encoding: 7bit' . "\r\n\r\n";
    $body .= $message_body . "\r\n\r\n";

    $body .= '--' . $boundary . "\r\n";
    $body .= 'Content-Type: ' . $attachment_type . '; name="' . $attachment_name . '"' . "\r\n";
    $body .= 'Content-Transfer-Encoding: base64' . "\r\n";
    $body .= 'Content-Disposition: attachment; filename="' . $attachment_name . '"' . "\r\n\r\n";
    $body .= $attachment_content . "\r\n";
    $body .= '--' . $boundary . '--';
} else {
    // Plain text message
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $body = $message_body;
}

// --- Send Email ---
$mailSent = mail($recipient, $subject, $body, implode("\r\n", $headers));

// --- Send Response ---
if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully!'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: Failed to send email. Check server mail logs.'
    ]);
}
?>