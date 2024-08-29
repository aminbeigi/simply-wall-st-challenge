<p align="center">
  <img src="images/sws-logo.png"/>
  <br/>
  <h3 align="center">Simply Wall St Task</h3>
</p>
<br />

# Description

A take-home coding exercise that requires us to build a backend API that returns
company data from an SQLite database.

## Assessment Criteria

-   Implementation of solid principles
-   Readability
-   Maintainability
-   Efficiency
-   Testability
-   Extensibility

## Notable Features

-   **API Versioning:** Endpoints use a version prefix to ensure backward
    compatibility.
-   **In-Memory Caching:** Redis is used to cache `swsCompanyPriceClose` table,
    speeding up responses and reducing database load.
-   **Pagination:** Efficiently handles large datasets by limiting and
    offsetting results.
-   **Modular Helper Functions:** Database and cache interactions are separated
    into dedicated functions. Can add functionality to every interaction, e.g.
    easily able to add logging before every query.
-   **Google TypeScript Style Guide:** Adheres to this style guide for
    consistency.

## Assumptions

-   **Price Fluctuation Calculation:** The 90 day price fluctuation is based on
    the date 22/5/2020. Using today’s date would show 0 results due to the
    database being outdated.
-   **Database Changes:** No changes to the database are allowed. If I could, I
    would add a new table, `swsCompanyVolatility`, would have been created to
    optimize volatility queries.
-   **Caching:** A cache is appropriate for storing price data to avoid
    expensive frequent database hits.
-   **Data Validity:** Assumes each company has at least one past price and a
    score. Otherwise, we would need additional error handling.

## Production Considerations

-   **Logging:** In production, a dedicated logging library with advanced
    features would be used for better control over logging levels and formats.

## If More Time Was Available

-   **Testing:** More robust testing suite including integration, end-to-end,
    and performance tests.
