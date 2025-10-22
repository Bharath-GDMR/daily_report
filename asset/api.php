<?php
require 'auth_check.php';

header('Content-Type: application/json');
$assets_json = file_get_contents('assets.json');
$assets = json_decode($assets_json, true);
$query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
if ($query) {
    $filtered_assets = array_filter($assets, function($asset) use ($query) {
        return (
            (isset($asset['storeName']) && strpos(strtolower($asset['storeName']), $query) !== false) ||
            (isset($asset['spaceCode']) && strpos(strtolower($asset['spaceCode']), $query) !== false) ||
            (isset($asset['category']) && strpos(strtolower($asset['category']), $query) !== false) ||
            (isset($asset['location']) && strpos(strtolower($asset['location']), $query) !== false) ||
            (isset($asset['material']) && strpos(strtolower($asset['material']), $query) !== false) ||
            (isset($asset['inventoryMedium']) && strpos(strtolower($asset['inventoryMedium']), $query) !== false) ||
            (isset($asset['inventoryType']) && strpos(strtolower($asset['inventoryType']), $query) !== false)
        );
    });
    echo json_encode(array_values($filtered_assets));
} else {
    echo json_encode($assets);
}
?>