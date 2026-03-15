<?php
header('X-LiteSpeed-Purge: *');
header('Cache-Control: no-cache, no-store, must-revalidate');
echo '<html><body style="font-family:sans-serif;padding:40px;text-align:center">';
echo '<h1 style="color:green">&#10003; LiteSpeed cache geleegd!</h1>';
echo '<p>Alle paginas worden nu vers ingeladen.</p>';
echo '<a href="/" style="background:#e87c28;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Ga naar de homepage &rarr;</a>';
echo '</body></html>';
?>
