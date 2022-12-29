import { Router } from "express";
import ProtectedRoute from "../Middleware/ProtectedRoute";
import GroupController from '../Controllers/group/group';
import StaffProtectedRoute from "../Middleware/group/StaffProtectedRoute";
import MemberProtectedRoute from "../Middleware/group/MemberProtectedRoute";
import GroupLinksController from "../Controllers/group/groupLinks";
import GroupConfigController from "../Controllers/group/groupConfig";
import GroupPostsController from "../Controllers/group/groupPosts";
import GroupAttachments from "../Controllers/group/groupAttachments";

const router = Router();

router.get('/', ProtectedRoute, GroupController.index);

// get group by id
router.get('/id/:id', [ProtectedRoute, MemberProtectedRoute], GroupController.show);


// create new group
router.post('/new', ProtectedRoute, GroupController.create);

// delete group
router.delete('/id/:id', ProtectedRoute, GroupController.delete);

// get my groups
router.get('/my/page/:page/:filter?', ProtectedRoute, GroupController.showByFilter);

// toggle join/exit group or delete wheter is staff
router.post('/joinOrExit', ProtectedRoute, GroupController.joinOrExitGroup);
//* ------------------------------- LINKS CONTROLLER

// add/update link into grupo
router.post('/set/links', [ProtectedRoute, StaffProtectedRoute], GroupLinksController.update);

//* ------------------------------- CONFIG CONTROLLER

// set group basic config
router.put('/updateConfig', [ProtectedRoute, StaffProtectedRoute], GroupConfigController.update);

//* ------------------------------- POSTS CONTROLLER

// get group posts
router.get('/posts/:id', [ProtectedRoute, MemberProtectedRoute], GroupPostsController.index);

// add new post
router.post('/posts/:id', [ProtectedRoute, MemberProtectedRoute], GroupPostsController.create);

//* ------------------------------- ATTACHMENTS CONTROLLER

// insert attachment
router.post('/posts/:id/attachment', [ProtectedRoute, MemberProtectedRoute], GroupAttachments.create);

// delete attachment
router.delete('/posts/:id/attachment', [ProtectedRoute, MemberProtectedRoute], GroupAttachments.delete);

export default router;