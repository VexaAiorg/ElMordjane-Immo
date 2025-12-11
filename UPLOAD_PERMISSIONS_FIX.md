# Document Upload Permissions - COLLABORATEUR Role

## ✅ **FIXED: COLLABORATEUR Can Now Upload Documents**

### Changes Made

**File:** `backend/src/routes/uploadRoutes.ts`

#### Before:

```typescript
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

router.post("/temp", authenticateToken, isAdmin, uploadTempFiles, uploadTemp);
router.delete("/temp/:filename", authenticateToken, isAdmin, deleteTempFile);
```

#### After:

```typescript
import {
  authenticateToken,
  isAdminOrCollaborateur,
} from "../middleware/authMiddleware";

router.post(
  "/temp",
  authenticateToken,
  isAdminOrCollaborateur,
  uploadTempFiles,
  uploadTemp
);
router.delete(
  "/temp/:filename",
  authenticateToken,
  isAdminOrCollaborateur,
  deleteTempFile
);
```

### What This Fixes

✅ **COLLABORATEUR users can now:**

- Upload documents (Acte, Livret Foncier, Copie de Fiche)
- Upload photos for properties
- Delete their uploaded files if needed
- Complete the full property creation wizard (all 7 pages)

### Why This Was Needed

Previously, the upload routes were restricted to `isAdmin` only. This meant:

- ❌ COLLABORATEUR couldn't upload documents on page 4
- ❌ COLLABORATEUR couldn't upload photos on page 5
- ❌ COLLABORATEUR would get 403 Forbidden errors

Now with `isAdminOrCollaborateur`:

- ✅ Both roles can upload files
- ✅ COLLABORATEUR can complete the wizard successfully
- ✅ Uploads are still authenticated (login required)

### Security Notes

- **Authentication still required** - Users must be logged in
- **Role verification** - Only ADMIN and COLLABORATEUR roles allowed
- **File validation** - Multer middleware still validates file types/sizes
- **Temporary files** - Files uploaded to `/temp` before final property creation

---

## Updated Permission Matrix

| Action                         | ADMIN | COLLABORATEUR |
| ------------------------------ | ----- | ------------- |
| View properties (non-archived) | ✅    | ✅            |
| View archived properties       | ✅    | ❌            |
| Create property                | ✅    | ✅            |
| Edit property                  | ✅    | ✅            |
| **Upload documents**           | ✅    | **✅ NEW**    |
| **Delete temp files**          | ✅    | **✅ NEW**    |
| Archive property               | ✅    | ❌            |
| Delete property                | ✅    | ❌            |

---

**Status:** ✅ Ready to test - COLLABORATEUR can now upload documents in the wizard!
