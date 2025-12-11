"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostComment = void 0;
const typeorm_1 = require("typeorm");
const FashionPost_1 = require("./FashionPost");
let PostComment = class PostComment {
};
exports.PostComment = PostComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PostComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id' }),
    __metadata("design:type", String)
], PostComment.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], PostComment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_type' }),
    __metadata("design:type", String)
], PostComment.prototype, "userType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PostComment.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_comment_id', nullable: true }),
    __metadata("design:type", String)
], PostComment.prototype, "parentCommentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_edited', default: false }),
    __metadata("design:type", Boolean)
], PostComment.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PostComment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PostComment.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FashionPost_1.FashionPost, post => post.comments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'post_id' }),
    __metadata("design:type", FashionPost_1.FashionPost)
], PostComment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PostComment, comment => comment.replies, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_comment_id' }),
    __metadata("design:type", PostComment)
], PostComment.prototype, "parentComment", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PostComment, comment => comment.parentComment),
    __metadata("design:type", Array)
], PostComment.prototype, "replies", void 0);
exports.PostComment = PostComment = __decorate([
    (0, typeorm_1.Entity)('post_comments')
], PostComment);
//# sourceMappingURL=PostComment.js.map