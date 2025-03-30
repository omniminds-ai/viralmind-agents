# API Migration Guide

This guide provides instructions for migrating from the legacy API endpoints in `src/routes` to the new API endpoints in `src/api`.

## Overview

The API has been updated with a new version (v1) that includes several improvements:

1. Standardized response formats
2. Improved error handling
3. Enhanced validation
4. Reorganized endpoint structure
5. New features and endpoints

## Base URL Change

All endpoints have been updated to use a new base URL pattern:

- **Legacy:** `/api/[resource]`
- **v1:** `/api/v1/[resource]`

## Directory Structure

This migration guide is organized into the following sections:

- [General Changes](./general-changes.md) - Common changes across all endpoints
- [Authentication](./authentication.md) - Authentication changes
- [Error Handling](./error-handling.md) - Error handling changes
- [Validation](./validation.md) - Validation changes

### Endpoint-Specific Changes

- [Settings](./endpoints/settings.md)
- [Conversation](./endpoints/conversation.md)
- [Challenges](./endpoints/challenges.md)
- [Forge](./endpoints/forge.md)
- [Forge Upload](./endpoints/forge-upload.md)
- [Races](./endpoints/races.md)
- [Gym](./endpoints/gym.md)
- [Minecraft](./endpoints/minecraft.md)
- [Streams](./endpoints/streams.md)

## Migration Steps

1. Update all API endpoint URLs to use the new `/api/v1/` prefix
2. Update client code to handle the new standardized response format
3. Update error handling to work with the new error response format
4. Update requests to meet the new validation requirements
5. Review endpoint-specific changes for any breaking changes or new features
