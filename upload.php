<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Metodo non consentito']);
    exit;
}

$uploadDir = __DIR__ . '/allegati/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['file']) || !isset($_POST['filename'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'File o filename mancante']);
    exit;
}

$file = $_FILES['file'];
$filename = $_POST['filename'];

// Sanitizza il nome
$filename = preg_replace('/[^a-z0-9._-]/i', '_', $filename);
$filename = preg_replace('/_+/', '_', $filename);

// Controlla estensione
if (!preg_match('/\.(png|jpe?g|gif|webp|svg|pdf)$/i', $filename)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Tipo file non consentito']);
    exit;
}

// Sposta il file
$destination = $uploadDir . $filename;
if (move_uploaded_file($file['tmp_name'], $destination)) {
    chmod($destination, 0644);
    echo json_encode(['success' => true, 'filename' => $filename]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore nello spostamento file']);
}
?>