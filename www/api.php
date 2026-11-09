<?php

$route = isset($_REQUEST["url"]) ? $_REQUEST["url"] : null;
$method = getMethod();

if (!isAllowedRoute($method, $route)) {
  http_response_code(400);
  header('Content-Type: text/plain; charset=UTF-8');
  echo "Invalid API route";
  exit;
}

$url = "http://localhost:7070" . $route;
$response = "";
switch ($method) {
  case 'POST':
    $response = makePostRequest(getPostData(), $url);
    break;
  case 'GET':
    $response = makeGetRequest($url);
    break;
  default:
    return;
}

echo $response;

function getMethod() {
  return $_SERVER["REQUEST_METHOD"]; 
}

function isAllowedRoute($method, $route) {
  if (!is_string($route) || $route === "" || $route[0] !== "/"
      || substr($route, 0, 2) === "//"
      || strpos($route, "\\") !== false
      || strpos($route, "@") !== false
      || strpos($route, ":") !== false
      || preg_match('/[\x00-\x1F\x7F?#]/', $route)) {
    return false;
  }

  if ($method === "POST") {
    return in_array($route, array(
      "/checkroster",
      "/livecheck",
      "/availableoptions",
      "/statistics",
      "/unitcost/",
      "/createhtml",
      "/createpdf"
    ), true);
  }

  if ($method !== "GET") {
    return false;
  }

  if ($route === "/armylist") {
    return true;
  }

  if (preg_match('/^\/(?:categorylist|armyinfo|allunitsdescriptions|alloptiondescriptions|armyicon)\/[^\/]+$/uD', $route)) {
    return true;
  }

  if (preg_match('/^\/(?:unitlist|unitsize|optionlist|unitdescription)\/[^\/]+\/[^\/]+$/uD', $route)) {
    return true;
  }

  if (preg_match('/^\/(?:optiondescription|html|pdf|text|bbcode)\/.+$/uD', $route)) {
    return true;
  }

  return false;
}

function getPostData() {
  return http_build_query($_POST);
}

function makePostRequest($data, $url) {
  $httpHeader = array('Content-Type: application/json', 'Content-Length: ' . strlen($data));
  return makePutOrPostCurl('POST', $data, true, $httpHeader, $url);
}

function makeGetRequest($url) {
  $ch = initCurl($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $response = curl_exec($ch);
  $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  header('Content-Type: '.$contentType);
  curl_close($ch);

  return $response;
}

function makePutOrPostCurl($type, $data, $returnTransfer, $httpHeader, $url) {

  $ch = initCurl($url);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $type);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, $returnTransfer);
  
  $response = curl_exec($ch);
  $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
  header('Content-Type: '.$contentType);
  curl_close($ch);

  return $response;
}

function initCurl($url) {
  $httpHeader = array('Content-Type: application/x-www-form-urlencoded');

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, str_replace(" ", "%20", $url));
  curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
  curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP);

  return $ch;
}


?>