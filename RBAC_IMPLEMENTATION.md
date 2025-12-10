# Role-Based Access Control (RBAC) Implementation

## Overview

This document outlines the implementation of Role-Based Access Control (RBAC) in the ElMordjane-Immo real estate management system. The system now supports two distinct user roles: **ADMIN** and **COLLABORATEUR**.

---

## User Roles

### 1. ADMIN

- **Full System Access**
- Can perform all CRUD operations
- Can archive and delete properties
- Can view all properties (including archived ones)
- Can manage collaborateurs

### 2. COLLABORATEUR

- **Limited Access**
- Can create new properties
- Can view properties (excluding archived)
- Can edit properties (cannot change archive status)
- **Cannot** delete properties
- **Cannot** archive properties
- **Cannot** view archived properties

---

## Access Control Matrix

| Operation                    | ADMIN                   | COLLABORATEUR                     |
| ---------------------------- | ----------------------- | --------------------------------- |
| **Create Property**          | ✅                      | ✅                                |
| **View All Properties**      | ✅ (including archived) | ✅ (excluding archived)           |
| **View Property Details**    | ✅ (including archived) | ✅ (excluding archived)           |
| **Edit Property**            | ✅                      | ✅ (cannot modify archive status) |
| **Delete Property**          | ✅                      | ❌                                |
| **Archive Property**         | ✅                      | ❌                                |
| **View Archived Properties** | ✅                      | ❌                                |

---

## Backend Implementation

### 1. Database Schema Changes

**File:** `backend/prisma/schema.prisma`

Added new Role enum:

```prisma
enum Role {
  ADMIN
  COLLABORATEUR
}

model Utilisateur {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  motDePasse   String
  role         Role     @default(ADMIN)  // Changed from String to Role enum
  nom          String?
  prenom       String?
  photoProfil  String?
  dateCreation DateTime @default(now())
}
```

### 2. Authentication Middleware

**File:** `backend/src/middleware/authMiddleware.ts`

Added three middleware functions:

#### `isAdmin` _(Already existed)_

- Verifies user has ADMIN role
- Used for admin-only routes (delete, archive)

#### `isCollaborateur` _(New)_

- Verifies user has COLLABORATEUR role
- Used for collaborateur-specific routes (if any)

#### `isAdminOrCollaborateur` _(New)_

- Verifies user has either ADMIN or COLLABORATEUR role
- Used for routes accessible to both roles (create, read, update)

```typescript
export const isAdminOrCollaborateur = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user as JwtPayload;

  if (!user || (user.role !== "ADMIN" && user.role !== "COLLABORATEUR")) {
    res.status(403).json({
      status: "error",
      message: "Access denied. Admin or Collaborateur privileges required.",
    });
    return;
  }

  next();
};
```

### 3. Route Protection

**File:** `backend/src/routes/propertyRoutes.ts`

Updated route middleware:

```typescript
// CREATE - Both roles
router.post(
  "/",
  authenticateToken,
  isAdminOrCollaborateur,
  uploadPropertyFiles,
  createProperty
);

// READ ALL - Both roles (filtered in controller)
router.get("/", authenticateToken, isAdminOrCollaborateur, getAllProperties);

// READ ONE - Both roles (filtered in controller)
router.get("/:id", authenticateToken, isAdminOrCollaborateur, getPropertyById);

// UPDATE - Both roles (archive control in controller)
router.put(
  "/:id",
  authenticateToken,
  isAdminOrCollaborateur,
  uploadPropertyFiles,
  updateProperty
);

// DELETE - Admin only
router.delete("/:id", authenticateToken, isAdmin, deleteProperty);
```

### 4. Controller Logic

**File:** `backend/src/controllers/propertyController.ts`

#### `getAllProperties()`

Filters archived properties for collaborateurs:

```typescript
export const getAllProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const isAdmin = user?.role === "ADMIN";

  // Build where clause based on user role
  const whereClause: any = {};

  // Collaborateurs cannot view archived properties
  if (!isAdmin) {
    whereClause.archive = false;
  }

  const properties = await prisma.bienImmobilier.findMany({
    where: whereClause,
    // ... includes
  });

  res.status(200).json({ status: "success", data: properties });
};
```

#### `getPropertyById()`

Blocks access to archived properties for collaborateurs:

```typescript
export const getPropertyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const isAdmin = user?.role === "ADMIN";

  const property = await prisma.bienImmobilier.findUnique({
    where: { id: parseInt(id) },
    // ... includes
  });

  // Collaborateurs cannot access archived properties
  if (!isAdmin && property.archive) {
    res.status(403).json({
      status: "error",
      message:
        "Access denied. You do not have permission to view archived properties.",
    });
    return;
  }

  res.status(200).json({ status: "success", data: property });
};
```

#### `updateProperty()`

Prevents collaborateurs from changing archive status:

```typescript
export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = (req as any).user;
  const isAdmin = user?.role === "ADMIN";

  // Prevent collaborateurs from modifying archive status
  if (!isAdmin && data.bienImmobilier?.archive !== undefined) {
    const currentProperty = await prisma.bienImmobilier.findUnique({
      where: { id: propertyId },
      select: { archive: true },
    });

    if (
      currentProperty &&
      currentProperty.archive !== data.bienImmobilier.archive
    ) {
      res.status(403).json({
        status: "error",
        message:
          "Access denied. Only admins can change the archive status of properties.",
      });
      return;
    }
  }

  // Build update data object
  const updateData: any = {
    titre: data.bienImmobilier.titre,
    // ... other fields
  };

  // Only admins can update archive status
  if (isAdmin && data.bienImmobilier.archive !== undefined) {
    updateData.archive = data.bienImmobilier.archive;
  }

  await tx.bienImmobilier.update({
    where: { id: propertyId },
    data: updateData,
  });
};
```

---

## Frontend Considerations

### 1. API Integration

The existing frontend API client (`frontend/src/api/api.js`) will work seamlessly with the new RBAC system. No changes are required on the API call level.

### 2. UI/UX Updates (Recommended)

To complete the RBAC implementation, consider these frontend enhancements:

#### a) **Conditional Rendering Based on Role**

Store user role in context/state after login:

```javascript
// After successful login
const userData = loginResponse.data.user;
localStorage.setItem("userRole", userData.role);
```

#### b) **Hide/Disable Actions for Collaborateurs**

In property list/detail views:

```jsx
import { useState, useEffect } from "react";

const PropertyCard = ({ property }) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const isAdmin = userRole === "ADMIN";

  return (
    <div>
      {/* Show edit button for both */}
      <button onClick={() => handleEdit(property)}>Edit</button>

      {/* Show delete only for admins */}
      {isAdmin && (
        <button onClick={() => handleDelete(property.id)}>Delete</button>
      )}

      {/* Show archive only for admins */}
      {isAdmin && (
        <button onClick={() => handleArchive(property.id)}>Archive</button>
      )}
    </div>
  );
};
```

#### c) **Hide Archive Page Navigation for Collaborateurs**

In the sidebar:

```jsx
const Sidebar = () => {
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  return (
    <nav>
      <Link to="/dashboard/menu">All Properties</Link>
      <Link to="/dashboard/vente">Sold</Link>
      <Link to="/dashboard/location">Rented</Link>

      {/* Show Archives only for admins */}
      {isAdmin && <Link to="/dashboard/archives">Archives</Link>}
    </nav>
  );
};
```

#### d) **Hide Archive Status Dropdown in Edit Modal**

In `PropertyEditModal.jsx`:

```jsx
const PropertyEditModal = ({ property }) => {
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  return (
    <form>
      {/* Basic info fields */}
      {/* ... */}

      {/* Archive dropdown - Admin only */}
      {isAdmin && (
        <div className="input-group">
          <label>Archive Status</label>
          <select name="archive" value={formData.archive}>
            <option value="false">Active</option>
            <option value="true">Archived</option>
          </select>
        </div>
      )}
    </form>
  );
};
```

---

## User Management

### Creating Users

#### Creating an ADMIN:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securePassword123",
    "nom": "Doe",
    "prenom": "John",
    "role": "ADMIN"
  }'
```

#### Creating a COLLABORATEUR:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "collaborateur@example.com",
    "password": "securePassword123",
    "nom": "Smith",
    "prenom": "Jane",
    "role": "COLLABORATEUR"
  }'
```

### Default Behavior

- If `role` is not specified during signup, the user is created as `COLLABORATEUR` by default.

---

## API Response Codes

### 403 Forbidden

Returned when a user attempts an action they don't have permission for:

**Example - Collaborateur trying to delete:**

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required."
}
```

**Example - Collaborateur trying to view archived property:**

```json
{
  "status": "error",
  "message": "Access denied. You do not have permission to view archived properties."
}
```

**Example - Collaborateur trying to change archive status:**

```json
{
  "status": "error",
  "message": "Access denied. Only admins can change the archive status of properties."
}
```

---

## Testing the Implementation

### 1. Test Collaborateur Restrictions

```bash
# Login as collaborateur
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"collaborateur@example.com","password":"password"}' \
  | jq -r '.data.token')

# Try to delete a property (should fail with 403)
curl -X DELETE http://localhost:3000/api/properties/1 \
  -H "Authorization: Bearer $TOKEN"

# Try to view all properties (should not include archived)
curl http://localhost:3000/api/properties \
  -H "Authorization: Bearer $TOKEN"

# Try to view an archived property (should fail with 403)
curl http://localhost:3000/api/properties/ARCHIVED_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Admin Access

```bash
# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# Delete property (should succeed)
curl -X DELETE http://localhost:3000/api/properties/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# View all properties (should include archived)
curl http://localhost:3000/api/properties \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Security Considerations

1. **Role Validation on Backend**: All role checks are performed on the backend. Never rely solely on frontend role hiding.

2. **Token-Based Role**: User role is embedded in the JWT token and verified on each request.

3. **Database-Level Enforcement**: Archive filtering is done at the database query level to prevent data leakage.

4. **Immutable Archive Status**: Once a property is archived by an admin, collaborateurs cannot unarchive it.

---

## Migration Notes

### Existing Users

After deploying this update, **all existing users will have their role reset** due to the schema change from `String` to `Role` enum. You may need to:

1. Manually update user roles in the database:

```sql
UPDATE "Utilisateur" SET role = 'ADMIN' WHERE email = 'admin@example.com';
UPDATE "Utilisateur" SET role = 'COLLABORATEUR' WHERE email IN (...);
```

2. Or recreate user accounts via the signup endpoint.

### Backup Recommendation

Before deploying, backup the `Utilisateur` table:

```sql
CREATE TABLE "Utilisateur_backup" AS SELECT * FROM "Utilisateur";
```

---

## Summary

✅ **Backend Implementation Complete**

- Role enum added to schema
- Middleware functions created
- Routes protected with appropriate middleware
- Controller logic enforces role-based filtering

⏳ **Frontend Updates Recommended**

- Conditionally render delete/archive buttons
- Hide archive navigation for collaborateurs
- Disable archive status field in edit modal for collaborateurs

🔒 **Security**

- All enforcement done on backend
- Token-based role verification
- Database-level filtering for archived properties

---

**Implementation Date:** 2025-12-11  
**Version:** 1.0.0  
**Author:** Gemini - Antigravity
