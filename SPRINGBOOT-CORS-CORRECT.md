# Correct SpringBoot CORS Configuration

## ❌ Current Issue

Your CORS configuration has HTTP methods in the headers section:

```java
// WRONG - This puts HTTP methods in headers
configuration.setAllowedHeaders(Arrays.asList(HttpMethod.GET.name(), HttpMethod.POST.name(), HttpMethod.PUT.name(),
                HttpMethod.DELETE.name(),HttpMethod.PATCH.name(), HttpMethod.OPTIONS.name()));
```

## ✅ Correct Configuration

Replace your `corsConfigurationSource()` method with this:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    var configuration = new CorsConfiguration();

    // Allow all origins (or specify your frontend URL)
    configuration.addAllowedOriginPattern(CorsConfiguration.ALL);

    // ✅ CORRECT: HTTP METHODS go in setAllowedMethods()
    configuration.setAllowedMethods(Arrays.asList(
        HttpMethod.GET.name(),
        HttpMethod.POST.name(),
        HttpMethod.PUT.name(),
        HttpMethod.DELETE.name(),
        HttpMethod.PATCH.name(),
        HttpMethod.OPTIONS.name()
    ));

    // ✅ CORRECT: HTTP HEADERS go in setAllowedHeaders()
    configuration.addAllowedHeader(CorsConfiguration.ALL);

    // Enable credentials for Basic Auth
    configuration.setAllowCredentials(true);

    // Cache preflight response
    configuration.setMaxAge(3600L);

    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 🎯 Key Differences

| Method                | Purpose      | Your Current Code   | Should Be                            |
| --------------------- | ------------ | ------------------- | ------------------------------------ |
| `setAllowedMethods()` | HTTP verbs   | ❌ Missing          | ✅ GET, POST, PUT, DELETE, OPTIONS   |
| `setAllowedHeaders()` | HTTP headers | ❌ Has HTTP methods | ✅ authorization, content-type, etc. |

## 🔍 What Each Method Does

- **`setAllowedMethods()`**: Allows HTTP verbs like GET, POST, PUT, DELETE
- **`setAllowedHeaders()`**: Allows HTTP headers like "Authorization", "Content-Type"

## ✅ Alternative Explicit Version

If you prefer to be more explicit:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    var configuration = new CorsConfiguration();

    // Allow specific origins
    configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:5173"));

    // Allow HTTP methods
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

    // Allow specific headers
    configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "accept", "origin"));

    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

After this fix, your PUT/DELETE operations should work!
