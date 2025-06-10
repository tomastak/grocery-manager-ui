# SpringBoot CORS Fix for PUT/DELETE Operations

## Issue

While GET and POST work, PUT operations are failing with "Invalid CORS request" (403).

## ✅ Enhanced CORS Configuration

Update your SpringBoot configuration to handle all HTTP methods properly:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins (more secure than *)
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:5173"));

        // Explicitly allow all HTTP methods including PUT and DELETE
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"
        ));

        // Allow all headers including Authorization
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Enable credentials for Basic Auth
        configuration.setAllowCredentials(true);

        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        // Apply to all paths
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## ✅ Alternative: Controller-Level CORS (If global doesn't work)

Add this to your ProductController:

```java
@RestController
@RequestMapping("/api/v1/products")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:5173"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true"
)
public class ProductController {

    // Your existing methods...

    @PutMapping("/{code}")
    public ResponseEntity<ProductTO_Read> updateProduct(
            @PathVariable String code,
            @RequestBody ProductTO_Update product) {
        // Your existing implementation
    }
}
```

## ✅ Manual OPTIONS Handler (Last Resort)

If CORS still doesn't work, add explicit OPTIONS handlers:

```java
@RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
public ResponseEntity<?> handleOptions() {
    return ResponseEntity.ok()
            .header("Access-Control-Allow-Origin", "http://localhost:3000")
            .header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            .header("Access-Control-Allow-Headers", "authorization,content-type")
            .header("Access-Control-Allow-Credentials", "true")
            .header("Access-Control-Max-Age", "3600")
            .build();
}
```

## 🔍 Test the Fix

```bash
# Test OPTIONS for PUT request (should return 200)
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  http://localhost:8080/api/v1/products/APPLE1

# Test actual PUT request
curl -X PUT \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"name":"Updated Apple","stockQuantity":100,"pricePerUnit":2.50}' \
  http://localhost:8080/api/v1/products/APPLE1
```

## 🎯 Key Changes

1. **Explicit method list** including PUT and DELETE
2. **Specific origins** instead of wildcard (more secure)
3. **Proper credentials handling**
4. **Controller-level backup** if global CORS fails

Try the **Enhanced CORS Configuration** first - it should fix the PUT/DELETE issues.
