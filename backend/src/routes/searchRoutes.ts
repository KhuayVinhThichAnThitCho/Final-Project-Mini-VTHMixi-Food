import { Router } from 'express';
import { searchController } from '../controllers/searchController';

const router = Router();

// Route: Gợi ý autocomplete (phải đứng trước route tổng hợp)
router.get('/suggestions', searchController.getSuggestions);

// Route: Tìm kiếm tổng hợp
router.get('/', searchController.search);

export default router;
