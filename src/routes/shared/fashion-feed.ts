import { Router } from 'express';
import { AppDataSource } from '../../config/data-source';
import { FashionPost } from '../../entities/FashionPost';
import { PostLike } from '../../entities/PostLike';
import { PostComment } from '../../entities/PostComment';
import { authenticate, authorize } from '../../middleware/auth';
import { AuthRequest } from '../../types';

const router = Router();

router.post('/posts', authenticate, authorize('vendor'), async (req: AuthRequest, res) => {
  try {
    const { caption, media, tags, postType, productId } = req.body;
    const userId = req.user!.id;

    const postRepo = AppDataSource.getRepository(FashionPost);
    const newPost = postRepo.create({
      vendorId: userId,
      caption: caption || '',
      media: media || [],
      tags: tags || [],
      postType: postType || 'image',
      productId,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      shareCount: 0,
      isActive: true
    });

    await postRepo.save(newPost);

    res.status(201).json({
      message: 'Fashion post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Error creating fashion post:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, vendorId, tag } = req.query;
    const postRepo = AppDataSource.getRepository(FashionPost);

    const queryBuilder = postRepo.createQueryBuilder('post')
      .where('post.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('post.vendor', 'vendor')
      .orderBy('post.createdAt', 'DESC')
      .skip((+page - 1) * +limit)
      .take(+limit);

    if (vendorId) {
      queryBuilder.andWhere('post.vendorId = :vendorId', { vendorId });
    }

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(post.tags)', { tag });
    }

    const [posts, total] = await queryBuilder.getManyAndCount();

    res.json({
      posts,
      pagination: {
        page: +page,
        limit: +limit,
        total,
        totalPages: Math.ceil(total / +limit)
      }
    });
  } catch (error) {
    console.error('Error fetching fashion feed:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.post('/posts/:postId/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.id;
    const userType = req.user!.role === 'vendor' ? 'vendor' : 'customer';

    const likeRepo = AppDataSource.getRepository(PostLike);
    const postRepo = AppDataSource.getRepository(FashionPost);

    const existingLike = await likeRepo.findOne({
      where: { postId, userId, userType }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'You already liked this post' });
    }

    const newLike = likeRepo.create({
      postId,
      userId,
      userType
    });

    await likeRepo.save(newLike);

    await postRepo.increment({ id: postId }, 'likeCount', 1);

    res.status(201).json({
      message: 'Post liked successfully',
      like: newLike
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
});

router.delete('/posts/:postId/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.id;
    const userType = req.user!.role === 'vendor' ? 'vendor' : 'customer';

    const likeRepo = AppDataSource.getRepository(PostLike);
    const postRepo = AppDataSource.getRepository(FashionPost);

    const existingLike = await likeRepo.findOne({
      where: { postId, userId, userType }
    });

    if (!existingLike) {
      return res.status(404).json({ message: 'Like not found' });
    }

    await likeRepo.remove(existingLike);
    await postRepo.decrement({ id: postId }, 'likeCount', 1);

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
});

router.post('/posts/:postId/comments', authenticate, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user!.id;
    const userType = req.user!.role === 'vendor' ? 'vendor' : 'customer';

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const commentRepo = AppDataSource.getRepository(PostComment);
    const postRepo = AppDataSource.getRepository(FashionPost);

    const newComment = commentRepo.create({
      postId,
      userId,
      userType,
      content: content.trim(),
      parentCommentId: parentCommentId || undefined
    });

    await commentRepo.save(newComment);
    await postRepo.increment({ id: postId }, 'commentCount', 1);

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const commentRepo = AppDataSource.getRepository(PostComment);

    const comments = await commentRepo.find({
      where: { postId },
      relations: ['replies'],
      order: { createdAt: 'DESC' }
    });

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

export default router;
