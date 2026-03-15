<?php
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: public, max-age=86400');
readfile(__DIR__ . '/forms.js');
