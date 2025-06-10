# SpringBoot CORS Configuration Fix

## Problem

Your SpringBoot API is rejecting OPTIONS preflight requests with 401, preventing CORS authentication.

## ✅ Solution 1: Security Configuration (Recommended)

Add this to your SpringBoot security configuration:

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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // Allow all OPTIONS requests
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## ✅ Solution 2: Controller-Level CORS

Add this to your controllers:

```java
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ProductController {
    // Your existing controller methods
}
```

## ✅ Solution 3: Global CORS Configuration

Add this configuration class:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## 🎯 Key Points:

1. **OPTIONS requests MUST be allowed without authentication**
2. **CORS headers should include all methods (including OPTIONS)**
3. **allowCredentials(true) is needed for Basic Auth**
4. **Use allowedOriginPatterns("_") instead of allowedOrigins("_") when using credentials**

## 🔍 Test Your Fix:

```bash
# Test OPTIONS request (should return 200, not 401)
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  http://localhost:8080/api/v1/products

# Test authenticated GET request
curl -X GET \
  -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  http://localhost:8080/api/v1/products
```

Choose **Solution 1** for the most comprehensive fix.
