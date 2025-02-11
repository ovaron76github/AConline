<?php

$url = "http://localhost:7070" . $_REQUEST["url"];

if(!$url) {
  return;
}

$response = "";
switch (getMethod()) {
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

  return $ch;
}


?>