# PrimeBasket Development Rules

## Code Quality
- Use descriptive names.
- Keep functions and components focused.
- Reuse common logic.
- Avoid committing build output.

## Frontend
- Use TypeScript types.
- Handle API loading and errors.
- Test responsive layouts.

## Backend
- Separate controllers, services, repositories, and DTOs.
- Validate incoming requests.
- Protect private endpoints.

## Security
- Never commit .env files, credentials, tokens, or real secrets.
- Use environment variables for production configuration.
- Rotate secrets if exposed publicly.

## Git
- Review staged files before committing.
- Use meaningful commit messages.
- Never force-push without a clear reason.
