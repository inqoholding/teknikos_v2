# TeknikOS Data Handling

## Scope
- Account data: name, email, phone, role, auth/session metadata
- Operational data: customers, technicians, jobs, invoices, inventory, contracts, support tickets
- Technical data: error logs, rate-limit counters, CSRF/session cookies, security metadata

## Controls
- Schema-based validation with strict object parsing on app-managed endpoints
- Ownership and role-based authorization checks
- Rate limiting on public API access with IP plus request-identity keys where available
- Secrets stored server-side via environment variables
- HTTPS expected in production

## Retention
- Primary business data is retained while the workspace is active or required for operational/legal purposes
- Security and support records may be retained longer for auditing and incident response

## Third Parties
- WAHA integration must use server-side environment variables only
- No frontend bundle may expose backend secret keys

## GDPR
- If TeknikOS is offered to EEA/UK users, access/correction/deletion requests should be processed under the applicable GDPR basis
