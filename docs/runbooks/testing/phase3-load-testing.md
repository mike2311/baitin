# Phase 3 Load Testing Plan

## Overview

This document outlines the load testing strategy for Phase 3 modules (Shipping Order, Delivery Note, Loading, Invoice, Enquiry, Reporting) to ensure the system can handle production workloads.

## Load Test Scenarios

### Scenario 1: Concurrent SO Creation
**Objective:** Test system performance with 50 concurrent users creating Shipping Orders

**Test Configuration:**
- Virtual Users: 50
- Ramp-up Time: 60 seconds
- Test Duration: 10 minutes
- Target Endpoint: `POST /api/shipping-orders`

**Success Criteria:**
- 95% of requests complete within 500ms
- Error rate < 1%
- No memory leaks or performance degradation

**Test Script:**
```javascript
// k6 script example
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '60s', target: 50 }, // Ramp up to 50 users
    { duration: '10m', target: 50 }, // Stay at 50 users
    { duration: '60s', target: 0 },  // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    soNo: `SO-LOAD-${Date.now()}-${__VU}`,
    date: '2025-01-15',
    custNo: 'CUST001',
    details: [
      {
        itemNo: 'ITEM001',
        qty: 100,
        price: 10.50,
      },
    ],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  const res = http.post('http://localhost:3000/api/shipping-orders', payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

### Scenario 2: Concurrent Invoice Search
**Objective:** Test search performance with 100 concurrent users

**Test Configuration:**
- Virtual Users: 100
- Ramp-up Time: 120 seconds
- Test Duration: 15 minutes
- Target Endpoint: `GET /api/invoices/enquiry`

**Success Criteria:**
- 95% of requests complete within 1s
- Error rate < 0.5%
- Database query performance maintained

**Test Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '120s', target: 100 },
    { duration: '15m', target: 100 },
    { duration: '120s', target: 0 },
  ],
};

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
    tags: { name: 'InvoiceSearch' },
  };

  const res = http.get('http://localhost:3000/api/invoices/enquiry?page=1&limit=50', params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(2);
}
```

### Scenario 3: Concurrent Document Generation
**Objective:** Test document generation with 20 concurrent requests

**Test Configuration:**
- Virtual Users: 20
- Ramp-up Time: 30 seconds
- Test Duration: 5 minutes
- Target Endpoint: `POST /api/shipping-orders/{soNo}/documents`

**Success Criteria:**
- 95% of requests complete within 10s
- Error rate < 2%
- Server resources (CPU, memory) remain stable

**Test Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '5m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const soNo = `SO-DOC-${__VU}`;
  const payload = JSON.stringify({
    format: 'excel',
    formatKey: 'DEFAULT',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  const res = http.post(`http://localhost:3000/api/shipping-orders/${soNo}/documents`, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 10s': (r) => r.timings.duration < 10000,
  });

  sleep(10);
}
```

### Scenario 4: Concurrent Report Generation
**Objective:** Test report generation with 30 concurrent requests

**Test Configuration:**
- Virtual Users: 30
- Ramp-up Time: 60 seconds
- Test Duration: 10 minutes
- Target Endpoint: `POST /api/reporting/generate`

**Success Criteria:**
- 95% of requests complete within 15s
- Error rate < 3%
- Database connection pool not exhausted

**Test Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '60s', target: 30 },
    { duration: '10m', target: 30 },
    { duration: '60s', target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    reportKey: 'SALES_ANALYSIS',
    format: 'excel',
    parameters: {
      dateFrom: '2025-01-01',
      dateTo: '2025-01-31',
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  const res = http.post('http://localhost:3000/api/reporting/generate', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 15s': (r) => r.timings.duration < 15000,
  });

  sleep(15);
}
```

### Scenario 5: Mixed Workload
**Objective:** Test realistic mixed workload with various operations

**Test Configuration:**
- Virtual Users: 75
- Ramp-up Time: 180 seconds
- Test Duration: 30 minutes
- Operations: SO creation (20%), DN creation (20%), Invoice search (30%), Document generation (15%), Report generation (15%)

**Success Criteria:**
- All operations meet their individual performance targets
- Overall system stability maintained
- No resource exhaustion

**Test Script:**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '180s', target: 75 },
    { duration: '30m', target: 75 },
    { duration: '180s', target: 0 },
  ],
};

export default function () {
  const operation = randomIntBetween(1, 100);
  const baseUrl = 'http://localhost:3000/api';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
  };

  if (operation <= 20) {
    // SO Creation
    const payload = JSON.stringify({
      soNo: `SO-MIXED-${Date.now()}-${__VU}`,
      date: '2025-01-15',
      custNo: 'CUST001',
      details: [{ itemNo: 'ITEM001', qty: 100, price: 10.50 }],
    });
    const res = http.post(`${baseUrl}/shipping-orders`, payload, { headers });
    check(res, { 'SO created': (r) => r.status === 201 });
  } else if (operation <= 40) {
    // DN Creation
    const payload = JSON.stringify({
      dnNo: `DN-MIXED-${Date.now()}-${__VU}`,
      date: '2025-01-16',
      custNo: 'CUST001',
      details: [{ itemNo: 'ITEM001', qty: 100 }],
    });
    const res = http.post(`${baseUrl}/delivery-notes`, payload, { headers });
    check(res, { 'DN created': (r) => r.status === 201 });
  } else if (operation <= 70) {
    // Invoice Search
    const res = http.get(`${baseUrl}/invoices/enquiry?page=1&limit=50`, { headers });
    check(res, { 'Invoice search': (r) => r.status === 200 });
  } else if (operation <= 85) {
    // Document Generation
    const soNo = 'SO001';
    const payload = JSON.stringify({ format: 'excel', formatKey: 'DEFAULT' });
    const res = http.post(`${baseUrl}/shipping-orders/${soNo}/documents`, payload, { headers });
    check(res, { 'Document generated': (r) => r.status === 200 });
  } else {
    // Report Generation
    const payload = JSON.stringify({
      reportKey: 'SALES_ANALYSIS',
      format: 'excel',
      parameters: { dateFrom: '2025-01-01', dateTo: '2025-01-31' },
    });
    const res = http.post(`${baseUrl}/reporting/generate`, payload, { headers });
    check(res, { 'Report generated': (r) => r.status === 200 });
  }

  sleep(randomIntBetween(1, 5));
}
```

## Database Load Testing

### Scenario 6: Large Dataset Queries
**Objective:** Test query performance with 100K+ transaction records

**Test Configuration:**
- Database Size: 100,000+ records in each transaction table
- Query Types: Complex joins, aggregations, date range filters
- Concurrent Queries: 50

**Success Criteria:**
- Query execution time < 2s for 95% of queries
- Database CPU usage < 80%
- No query timeouts

## Tools and Setup

### Recommended Tools
1. **k6** - Modern load testing tool (recommended)
2. **Artillery** - Node.js based load testing
3. **JMeter** - Traditional load testing tool
4. **Gatling** - Scala-based load testing

### Test Environment Setup
- **Staging Environment:** Mirror of production
- **Database:** Test database with realistic data volumes
- **Monitoring:** Application performance monitoring (APM) tools
- **Metrics Collection:** Prometheus + Grafana

### Prerequisites
1. Test database seeded with appropriate data volumes
2. Authentication tokens for load test users
3. Monitoring dashboards configured
4. Test environment isolated from production

## Execution Plan

### Phase 1: Baseline Testing (Week 1)
- Run individual scenario tests
- Establish baseline performance metrics
- Identify initial bottlenecks

### Phase 2: Optimization (Week 2)
- Address identified bottlenecks
- Optimize slow queries
- Improve caching strategies
- Re-run tests to verify improvements

### Phase 3: Stress Testing (Week 3)
- Increase load beyond expected production levels
- Identify breaking points
- Test failure scenarios and recovery

### Phase 4: Endurance Testing (Week 4)
- Long-duration tests (4-8 hours)
- Check for memory leaks
- Verify system stability over time

## Metrics to Monitor

### Application Metrics
- Response time (p50, p95, p99)
- Request rate (requests/second)
- Error rate (%)
- Throughput (transactions/second)

### System Metrics
- CPU usage (%)
- Memory usage (MB, %)
- Database connection pool usage
- Network I/O

### Database Metrics
- Query execution time
- Connection count
- Lock wait time
- Cache hit ratio

## Success Criteria Summary

| Scenario | Virtual Users | Target Response Time (p95) | Max Error Rate |
|----------|---------------|----------------------------|----------------|
| SO Creation | 50 | <500ms | <1% |
| Invoice Search | 100 | <1s | <0.5% |
| Document Generation | 20 | <10s | <2% |
| Report Generation | 30 | <15s | <3% |
| Mixed Workload | 75 | Varies by operation | <1% |

## Reporting

After each test execution, generate reports including:
1. **Performance Summary:** Response times, throughput, error rates
2. **Resource Utilization:** CPU, memory, database metrics
3. **Bottleneck Analysis:** Identified performance issues
4. **Recommendations:** Optimization suggestions
5. **Comparison:** Baseline vs. optimized results

## Risk Mitigation

- **Risk:** Test environment not representative of production
  - **Mitigation:** Use production-like data volumes and configurations

- **Risk:** Load tests impact other systems
  - **Mitigation:** Isolate test environment, use dedicated infrastructure

- **Risk:** Insufficient test data
  - **Mitigation:** Seed database with realistic data volumes before testing

## Next Steps

1. Set up load testing infrastructure
2. Create test data seeders for large datasets
3. Configure monitoring and alerting
4. Execute baseline tests
5. Analyze results and optimize
6. Re-test and validate improvements
7. Document findings and recommendations
