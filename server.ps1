$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
try {
    $listener.Start()
    Write-Host "Local HTTP Server started successfully."
    Write-Host "You can access the website at: http://localhost:8080/"
    
    # Keep listening for incoming HTTP requests
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { 
            $urlPath = "/index.html" 
        }
        
        # Sanitize path to prevent directory traversal
        $urlPath = $urlPath.Replace("..", "")
        $filePath = Join-Path "c:\Users\muni pavan kumar\OneDrive\Documents\Desktop\RESEARCH\website" $urlPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set basic Content-Type headers
            if ($filePath.EndsWith(".html")) { 
                $response.ContentType = "text/html; charset=utf-8" 
            } elseif ($filePath.EndsWith(".css")) { 
                $response.ContentType = "text/css" 
            } elseif ($filePath.EndsWith(".js")) { 
                $response.ContentType = "application/javascript" 
            } elseif ($filePath.EndsWith(".png")) { 
                $response.ContentType = "image/png" 
            } elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { 
                $response.ContentType = "image/jpeg" 
            }
            
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Error: $_"
} finally {
    $listener.Close()
}
