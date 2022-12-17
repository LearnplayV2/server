import { Router } from "express";
import ProtectedRoute from "../Middleware/ProtectedRoute";
import GroupController from '../Controllers/group/group';
import StaffProtectedRoute from "../Middleware/group/StaffProtectedRoute";
import MemberProtectedRoute from "../Middleware/group/MemberProtectedRoute";
import GroupLinksController from "../Controllers/group/groupLinks";
import GroupConfigController from "../Controllers/group/groupConfig";
import GroupPostsController from "../Controllers/group/groupPosts";

const router = Router();

router.get('/', ProtectedRoute, GroupController.index);

// get group by id
router.get('/id/:id', [ProtectedRoute, MemberProtectedRoute], GroupController.show);

// add/update link into grupo
router.post('/set/links', [ProtectedRoute, StaffProtectedRoute], GroupLinksController.update);

// create new group
router.post('/new', ProtectedRoute, GroupController.create);

// delete group
router.delete('/id/:id', ProtectedRoute, GroupController.delete);

// get my groups
router.get('/my/page/:page/:filter?', ProtectedRoute, GroupController.showByFilter);

// toggle join/exit group or delete wheter is staff
router.post('/joinOrExit', ProtectedRoute, GroupController.joinOrExitGroup);

// set group basic config
router.put('/updateConfig', [ProtectedRoute, StaffProtectedRoute], GroupConfigController.update);

// get group posts
router.get('/posts', [ProtectedRoute, MemberProtectedRoute], GroupPostsController.index);

export default router;