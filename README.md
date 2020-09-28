# Dropbox with Cache

This is a Dropbox with Cache application which is to host a server to store data with cache. The purpose of using cache is to speed up the loading of frequently accessed resources and to allow multiple users to request the same resource from server/ cache instead of local storage.

## How
* Create a HTTP server with express.js
* Read file from local directory with fs and Promise
* Handle HTTP request  
    * Pass file to server with POST request
    * Save file to server (cache as an object)
* Handle HTTP response
    * Retrieve file from from server storage for the first request
    * Create middleware to store the response data
    * Retrieve file from cache later



