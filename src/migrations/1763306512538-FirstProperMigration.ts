import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstProperMigration1763306512538 implements MigrationInterface {
  name = "FirstProperMigration1763306512538";

  private async ensureColumnNotNull(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    defaultValue: string
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    const column = table?.columns.find((c) => c.name === columnName);

    console.log("my column exist, amd it's name is:", column?.name);
    if (column) {
      // Check for NULL values
      const result = await queryRunner.query(
        `SELECT COUNT(*) as null_count FROM ${tableName} WHERE ${columnName} IS NULL`
      );
      const nullCount = parseInt(result[0].null_count);

      if (nullCount > 0) {
        console.log(
          `Updating ${nullCount} NULL values in ${tableName}.${columnName}`
        );
        await queryRunner.query(
          `UPDATE ${tableName} SET ${columnName} = $1 WHERE ${columnName} IS NULL`,
          [defaultValue]
        );
      }

      // Set NOT NULL constraint
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET NOT NULL`
      );
    } else {
      // Column doesn't exist, create with default
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ADD "${columnName}" character varying NOT NULL DEFAULT $1`,
        [defaultValue]
      );
      // Remove default if desired
      await queryRunner.query(
        `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP DEFAULT`
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Handle categories.name first
    await this.ensureColumnNotNull(
      queryRunner,
      "categories",
      "name",
      "Uncategorized"
    );

    // Handle other problematic columns
    await this.ensureColumnNotNull(
      queryRunner,
      "vendor_profiles",
      "business_name",
      "Default Business"
    );

    await this.ensureColumnNotNull(
      queryRunner,
      "categories",
      "slug",
      "default-cat-slug"
    );

    await this.ensureColumnNotNull(
      queryRunner,
      "products",
      "name",
      "Default Product Nanme"
    );

    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP CONSTRAINT "vendor_profiles_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "order_items_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "orders_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "products_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_wallet_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "wallets_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP CONSTRAINT "rider_documents_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP CONSTRAINT "rider_documents_reviewed_by_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_admin_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "vendor_subscriptions_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "FK_vendor_subscriptions_plan"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "FK_vendor_partnerships_requester"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "FK_vendor_partnerships_recipient"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" DROP CONSTRAINT "vendor_of_the_month_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP CONSTRAINT "FK_vendor_messages_sender"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP CONSTRAINT "FK_vendor_messages_receiver"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "vendor_collaborations_vendor_1_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "vendor_collaborations_vendor_2_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "FK_vendor_collaborations_vendor1"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "FK_vendor_collaborations_vendor2"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_subscription_invoices_vendor"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_subscription_invoices_subscription"`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" DROP CONSTRAINT "saved_locations_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_post_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_parent_comment_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_post_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "order_rejections_order_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "order_rejections_order_item_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "order_rejections_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "order_rejections_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "order_cancellations_order_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "order_cancellations_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "order_cancellations_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "order_cancellations_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_customer_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_vendor_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_rider_id_fkey"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_admin_id_fkey"`
    );
    await queryRunner.query(`DROP INDEX "public"."idx_order_items_order"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_transactions_entity"`);
    await queryRunner.query(`DROP INDEX "public"."idx_transactions_reference"`);
    await queryRunner.query(`DROP INDEX "public"."idx_transactions_order"`);
    await queryRunner.query(`DROP INDEX "public"."idx_transactions_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_vendors_subscription"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_vendor"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_category"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_gender"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_products_made_in_nigeria"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_payment_methods_customer_id"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_payment_methods_authorization_code"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_wallet_transactions_wallet"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_rider_documents_rider_id"`
    );
    await queryRunner.query(`DROP INDEX "public"."idx_rider_documents_status"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_rider_documents_reviewed_by"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_verification_codes_contact"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_verification_contact_used"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vendor_partnerships_requester"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vendor_partnerships_recipient"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vendor_partnerships_status"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_vendor_messages_sender"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vendor_messages_receiver"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vendor_messages_conversation"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_subscription_invoices_vendor"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_subscription_invoices_subscription"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_subscription_invoices_status"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_saved_locations_customer"`
    );
    await queryRunner.query(`DROP INDEX "public"."idx_post_comments_post"`);
    await queryRunner.query(`DROP INDEX "public"."idx_fashion_posts_vendor"`);
    await queryRunner.query(`DROP INDEX "public"."idx_fashion_posts_created"`);
    await queryRunner.query(`DROP INDEX "public"."idx_post_likes_post"`);
    await queryRunner.query(`DROP INDEX "public"."idx_payment_methods_entity"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_rejections_rejected"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_order_cancellations_cancelled"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "order_items_vendor_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "orders_payment_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "orders_order_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" DROP CONSTRAINT "riders_document_verification_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transactions_entity_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transactions_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transactions_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" DROP CONSTRAINT "vendors_subscription_tier_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "products_gender_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_transaction_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP CONSTRAINT "rider_documents_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_purpose_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "verification_codes_entity_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "vendor_subscriptions_tier_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "vendor_subscriptions_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "CHK_vendor_partnerships_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "CHK_vendor_partnerships_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" DROP CONSTRAINT "vendor_of_the_month_month_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "vendor_collaborations_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "CHK_vendor_collaborations_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" DROP CONSTRAINT "saved_locations_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "post_comments_user_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_user_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" DROP CONSTRAINT "paystack_payment_methods_entity_type_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "notifications_single_user_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP CONSTRAINT "influencer_picks_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP CONSTRAINT "delivery_partners_status_check"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" DROP CONSTRAINT "vendor_of_the_month_month_year_key"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "post_likes_post_id_user_id_user_type_key"`
    );
    await queryRunner.query(
      `CREATE TABLE "wishlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_620bff4a240d66c357b5d820eaa" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "cart" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL, "size" character varying, "color" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c524ec48751b9b5bcfbf6e59be7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text NOT NULL, "image" character varying, "author" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_39a43dfcb6007180f04aff2357e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "bio" text, "image" character varying, "gallery" jsonb, "instagram" character varying, "twitter" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef9ed7160ea69013636466bf2d5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "rider_location_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rider_id" uuid NOT NULL, "order_id" uuid, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "accuracy" numeric(10,2), "speed" numeric(10,2), "heading" numeric(10,2), "recorded_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6ae0d639ae4c23461bc2173d0c5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "tax_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_image"`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP COLUMN "wallet_balance"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "entity_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP COLUMN "partnership_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP COLUMN "product_ids"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "likes_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "comments_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "content"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "media_urls"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "reference_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "is_read"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "customer_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "vendor_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "rider_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "admin_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "product_ids"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "service_cities"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "service_types"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "user_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "customer_id" uuid`
    );
    await queryRunner.query(`ALTER TABLE "transactions" ADD "vendor_id" uuid`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD "rider_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "total_deliveries" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "rating" numeric(3,2) NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_partnerships_partnershiptype_enum" AS ENUM('collaboration', 'supplier', 'distributor', 'joint_venture', 'other')`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD "partnershipType" "public"."vendor_partnerships_partnershiptype_enum" NOT NULL DEFAULT 'collaboration'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD "productIds" jsonb`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "caption" text NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fashion_posts_posttype_enum" AS ENUM('image', 'video', 'carousel', 'styling_tip')`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "postType" "public"."fashion_posts_posttype_enum" NOT NULL DEFAULT 'image'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "media" jsonb NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "product_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "like_count" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "comment_count" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "view_count" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "share_count" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "is_featured" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "entity_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "entity_type" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" ADD "data" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "read" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "action_url" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD "productIds" jsonb NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "serviceCities" text`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "serviceTypes" text`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP CONSTRAINT "vendor_profiles_vendor_id_key"`
    );
    // await queryRunner.query(
    //   `ALTER TABLE "vendor_profiles" DROP COLUMN "business_name"`
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "vendor_profiles" ADD "business_name" character varying NOT NULL`
    // );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "business_phone"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "business_phone" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_account_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_account_name" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_account_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_account_number" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_name" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" TYPE numeric(10,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "rating" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "rating" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "is_approved" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "order_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "product_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "product_name" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "size"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "size" character varying`
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "color"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "color" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "vendor_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "vendor_status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_items_vendor_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'preparing', 'ready')`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "vendor_status" "public"."order_items_vendor_status_enum" NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "orders_order_number_key"`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_number"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "order_number" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number")`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "delivery_fee" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT '0'`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_status"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "order_status" character varying DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_method"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_method" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_status" character varying DEFAULT 'pending'`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivery_city"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_city" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_state"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_state" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_postal_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_postal_code" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_phone"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_phone" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "wallet" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "wallet" SET DEFAULT '{"balance":0,"pendingBalance":0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_approved" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_verified" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_available" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" DROP COLUMN "document_verification_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ADD "document_verification_status" character varying NOT NULL DEFAULT 'not_submitted'`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "entity_id" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_type_enum" AS ENUM('wallet_funding', 'wallet_withdrawal', 'order_payment', 'refund', 'commission', 'transfer')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "type" "public"."transactions_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "transactions_reference_key"`
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."transactions_status_enum" AS ENUM('pending', 'completed', 'failed', 'processing', 'cancelled')`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "wallet" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "wallet" SET DEFAULT '{"balance":0,"pendingBalance":0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_approved" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_verified" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_verified_akwa_ibom" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "vendor_of_month_count" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "vendors" ADD "address" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    // await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    // await queryRunner.query(
    //   `ALTER TABLE "categories" ADD "name" character varying NOT NULL`
    // );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "categories_slug_key"`
    );
    // await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
    // await queryRunner.query(
    //   `ALTER TABLE "categories" ADD "slug" character varying NOT NULL`
    // );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug")`
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "icon" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    // await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
    // await queryRunner.query(
    //   `ALTER TABLE "products" ADD "name" character varying NOT NULL`
    // );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "stock_quantity" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "images" text`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "gender"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "gender" character varying`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sizes"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "sizes" text`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "colors"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "colors" text`);
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "is_approved" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "rating" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "made_in_nigeria" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "styles_tags"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "styles_tags" text`);
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "is_default" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "wallet" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "wallet" SET DEFAULT '{"balance":0,"pendingBalance":0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "is_verified" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "customer_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "transaction_type"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_transaction_type_enum" AS ENUM('deposit', 'withdrawal', 'payment', 'refund')`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "transaction_type" "public"."wallet_transactions_transaction_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_reference_key"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "reference"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "reference" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "UQ_4b3d5cb7b4480ca1c3c367ebb45" UNIQUE ("reference")`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "description" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_transactions_status_enum" AS ENUM('pending', 'completed', 'failed')`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "status" "public"."wallet_transactions_status_enum" NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "customer_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "balance" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "drivers_license_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "drivers_license_number" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "drivers_license_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "drivers_license_cloudinary_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_type" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_registration"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_registration" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_photo_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_photo_cloudinary_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "national_id_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "national_id_number" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "national_id_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "national_id_cloudinary_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "status" character varying NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "submission_count" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "code"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "code" character varying(10) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "contact" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "type"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."verification_codes_type_enum" AS ENUM('sms', 'email')`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "type" "public"."verification_codes_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "purpose"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."verification_codes_purpose_enum" AS ENUM('signup', 'login', 'password_reset', 'phone_verification', 'email_verification')`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "purpose" "public"."verification_codes_purpose_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "participant_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "participant_type" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "used" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "verified" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "attempts" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "tier" SET DEFAULT 'free'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "status" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "status" SET DEFAULT 'active'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "amount" SET DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "item_limit" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "item_limit" SET DEFAULT '10'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "has_promo_feature" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "has_homepage_visibility" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "auto_renew" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_partnerships_status_enum" AS ENUM('pending', 'accepted', 'declined', 'active', 'inactive')`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD "status" "public"."vendor_partnerships_status_enum" NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ALTER COLUMN "featured_on_homepage" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP COLUMN "collaboration_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD "collaboration_id" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_collaborations_status_enum" AS ENUM('proposed', 'accepted', 'active', 'completed', 'rejected')`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD "status" "public"."vendor_collaborations_status_enum" NOT NULL DEFAULT 'proposed'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "is_featured" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "saved_locations" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."saved_locations_type_enum" AS ENUM('home', 'work', 'other')`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ADD "type" "public"."saved_locations_type_enum" NOT NULL DEFAULT 'other'`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "is_default" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP COLUMN "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD "user_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "is_edited" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "fashion_posts" DROP COLUMN "tags"`);
    await queryRunner.query(`ALTER TABLE "fashion_posts" ADD "tags" text`);
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "is_active" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD "user_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ADD "entity_id" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "is_default" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP COLUMN "rejection_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD "rejection_type" character varying NOT NULL DEFAULT 'delivery'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ALTER COLUMN "rejected_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP COLUMN "cancelled_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD "cancelled_by" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP COLUMN "refund_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD "refund_status" character varying NOT NULL DEFAULT 'not_applicable'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ALTER COLUMN "cancelled_at" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "title" character varying NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('order_update', 'payment', 'promotion', 'account', 'general')`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" "public"."notifications_type_enum" NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "tags"`
    );
    await queryRunner.query(`ALTER TABLE "influencer_picks" ADD "tags" text`);
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."influencer_picks_status_enum" AS ENUM('draft', 'published', 'archived')`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD "status" "public"."influencer_picks_status_enum" NOT NULL DEFAULT 'draft'`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "is_featured" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "view_count" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."delivery_partners_status_enum" AS ENUM('pending', 'active', 'inactive', 'suspended')`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "status" "public"."delivery_partners_status_enum" NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "total_deliveries" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "successful_deliveries" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "is_trusted" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "created_at" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "updated_at" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ba946b74eafecbb356e5556d1" ON "verification_codes" ("contact", "used", "created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_069a84b3e82ea701266d9a2800" ON "order_rejections" ("rejected_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_037b3bbe7c206d17c51cd33d00" ON "order_cancellations" ("cancelled_by", "cancelled_at") `
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ADD CONSTRAINT "UQ_c5a8d33f6ceee10b3c93985334f" UNIQUE ("month", "year")`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "UQ_95b16dd4e8d5e5a4c19ac93c637" UNIQUE ("post_id", "user_id", "user_type")`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD CONSTRAINT "FK_1f5076ae25966a5594e90b41b96" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_5df67164fb31bb298632acbbb0a" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_a261413fe1e85c38c6c5cb9bede" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6f09843c214f21a462b54b11e8d" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_5fb1addc4312f215acef39a3620" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_fbfc9b4ca7de073974fd4759fca" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_bf352c755492e9c5b14f36dbaa3" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" ADD CONSTRAINT "FK_16f64e06715ce4fea8257cc42c5" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_0e859a83f1dd6b774c20c02885d" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cart" ADD CONSTRAINT "FK_242205c81c1152fab1b6e848470" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "cart" ADD CONSTRAINT "FK_dccd1ec2d6f5644a69adf163bc1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_d8d4eb6f793843b5ee65cc5dada" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_c57d19129968160f4db28fc8b28" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_e02e5890b11b4a58ef849b8b298" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "FK_6580899a2293de27787376887fa" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD CONSTRAINT "FK_d6255150b48d54c2b92f99d3385" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD CONSTRAINT "FK_c5768a6dd4a283170a0423e1b47" FOREIGN KEY ("reviewed_by") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "FK_2955513e8d13cf115ba8efb99fa" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "FK_b158af4fedbee988e920ba2148e" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "FK_e2440d2fe03252a435d59ccc0bf" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "FK_b038f0b53125c5f024bf54cc48d" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "FK_8aa1cb87439202bcc58a3298ad4" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "FK_0cc2513158e82169028ed638dd9" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "FK_4204914b8dea212edcdaa8f7138" FOREIGN KEY ("requester_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "FK_067d86bd41a03630bb9eb08d3d3" FOREIGN KEY ("recipient_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ADD CONSTRAINT "FK_64afe62bb581835affc086fb88b" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD CONSTRAINT "FK_a29156801378d658b14ea1e32ad" FOREIGN KEY ("sender_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD CONSTRAINT "FK_9c7aa5f40da99be2df1136a96e9" FOREIGN KEY ("receiver_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "FK_f7dca7c151413acda4aa6498f97" FOREIGN KEY ("vendor_1_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "FK_6578d4a11e2ec8a88cf35176784" FOREIGN KEY ("vendor_2_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_96591662e5fd0796e863dd2d954" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_9c3813f2a99935850b2f2210191" FOREIGN KEY ("subscriptionId") REFERENCES "vendor_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ADD CONSTRAINT "FK_e31075627d53a7ffe51565d1446" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_location_history" ADD CONSTRAINT "FK_f9343f9e2fc920962d9af14c32f" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_location_history" ADD CONSTRAINT "FK_9cfb2b5d7c1b7aa97fe1ca104c3" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_e8ffd07822f03f90f637b13cd59" FOREIGN KEY ("post_id") REFERENCES "fashion_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "FK_47e60da1f7aeb75961190bff75d" FOREIGN KEY ("parent_comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD CONSTRAINT "FK_edc972a9a413099bf3b1121d2ee" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD CONSTRAINT "FK_2deebef335b96beb55a79b41344" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "FK_b40d37469c501092203d285af80" FOREIGN KEY ("post_id") REFERENCES "fashion_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "FK_69c988ec3abd83ebcd827db308a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "FK_a494333b5c24bbdd8cfb9d6df39" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "FK_e4585ff44938d6c5acc525ac869" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "FK_41b8f03cb1a679c96548395d869" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "FK_0cc344da3fb6f2c43f4b5549d9a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "FK_c2f03eab99f8a069dc06d5b545d" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "FK_3f71938ec5e60a0fcc9e306bf59" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "FK_b6a91645828e7dc0ff903ed4318" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "FK_b6a91645828e7dc0ff903ed4318"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "FK_3f71938ec5e60a0fcc9e306bf59"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "FK_c2f03eab99f8a069dc06d5b545d"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP CONSTRAINT "FK_0cc344da3fb6f2c43f4b5549d9a"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "FK_41b8f03cb1a679c96548395d869"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "FK_e4585ff44938d6c5acc525ac869"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "FK_a494333b5c24bbdd8cfb9d6df39"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP CONSTRAINT "FK_69c988ec3abd83ebcd827db308a"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "FK_b40d37469c501092203d285af80"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP CONSTRAINT "FK_2deebef335b96beb55a79b41344"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP CONSTRAINT "FK_edc972a9a413099bf3b1121d2ee"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_47e60da1f7aeb75961190bff75d"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP CONSTRAINT "FK_e8ffd07822f03f90f637b13cd59"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_location_history" DROP CONSTRAINT "FK_9cfb2b5d7c1b7aa97fe1ca104c3"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_location_history" DROP CONSTRAINT "FK_f9343f9e2fc920962d9af14c32f"`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" DROP CONSTRAINT "FK_e31075627d53a7ffe51565d1446"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_9c3813f2a99935850b2f2210191"`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" DROP CONSTRAINT "FK_96591662e5fd0796e863dd2d954"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "FK_6578d4a11e2ec8a88cf35176784"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP CONSTRAINT "FK_f7dca7c151413acda4aa6498f97"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP CONSTRAINT "FK_9c7aa5f40da99be2df1136a96e9"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP CONSTRAINT "FK_a29156801378d658b14ea1e32ad"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" DROP CONSTRAINT "FK_64afe62bb581835affc086fb88b"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "FK_067d86bd41a03630bb9eb08d3d3"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP CONSTRAINT "FK_4204914b8dea212edcdaa8f7138"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "FK_0cc2513158e82169028ed638dd9"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT "FK_8aa1cb87439202bcc58a3298ad4"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "FK_b038f0b53125c5f024bf54cc48d"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "FK_e2440d2fe03252a435d59ccc0bf"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "FK_b158af4fedbee988e920ba2148e"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP CONSTRAINT "FK_2955513e8d13cf115ba8efb99fa"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP CONSTRAINT "FK_c5768a6dd4a283170a0423e1b47"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP CONSTRAINT "FK_d6255150b48d54c2b92f99d3385"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" DROP CONSTRAINT "FK_6580899a2293de27787376887fa"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_e02e5890b11b4a58ef849b8b298"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_c57d19129968160f4db28fc8b28"`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_d8d4eb6f793843b5ee65cc5dada"`
    );
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_dccd1ec2d6f5644a69adf163bc1"`
    );
    await queryRunner.query(
      `ALTER TABLE "cart" DROP CONSTRAINT "FK_242205c81c1152fab1b6e848470"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_0e859a83f1dd6b774c20c02885d"`
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_16f64e06715ce4fea8257cc42c5"`
    );
    await queryRunner.query(
      `ALTER TABLE "wishlist" DROP CONSTRAINT "FK_bf352c755492e9c5b14f36dbaa3"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_3cb0558ed36997f1d9ecc1118e7"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_fbfc9b4ca7de073974fd4759fca"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_5fb1addc4312f215acef39a3620"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6f09843c214f21a462b54b11e8d"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_a261413fe1e85c38c6c5cb9bede"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_5df67164fb31bb298632acbbb0a"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP CONSTRAINT "FK_1f5076ae25966a5594e90b41b96"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" DROP CONSTRAINT "UQ_95b16dd4e8d5e5a4c19ac93c637"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" DROP CONSTRAINT "UQ_c5a8d33f6ceee10b3c93985334f"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_037b3bbe7c206d17c51cd33d00"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_069a84b3e82ea701266d9a2800"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ba946b74eafecbb356e5556d1"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "is_trusted" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "successful_deliveries" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ALTER COLUMN "total_deliveries" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."delivery_partners_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "status" character varying DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "view_count" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ALTER COLUMN "is_featured" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."influencer_picks_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD "status" character varying DEFAULT 'draft'`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "tags"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD "tags" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "type" character varying(50) NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "title" character varying(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ALTER COLUMN "cancelled_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP COLUMN "refund_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD "refund_status" character varying(20) DEFAULT 'not_applicable'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" DROP COLUMN "cancelled_by"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD "cancelled_by" character varying(20) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ALTER COLUMN "rejected_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" DROP COLUMN "rejection_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD "rejection_type" character varying(20) DEFAULT 'delivery'`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ALTER COLUMN "is_default" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ADD "entity_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "post_likes" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD "user_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "fashion_posts" DROP COLUMN "tags"`);
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "tags" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ALTER COLUMN "is_edited" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" DROP COLUMN "user_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD "user_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ALTER COLUMN "is_default" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "saved_locations" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."saved_locations_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ADD "type" character varying DEFAULT 'other'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ALTER COLUMN "is_featured" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."vendor_collaborations_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD "status" character varying DEFAULT 'proposed'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" DROP COLUMN "collaboration_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD "collaboration_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ALTER COLUMN "featured_on_homepage" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."vendor_partnerships_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD "status" character varying NOT NULL DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "auto_renew" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "has_homepage_visibility" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "has_promo_feature" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "item_limit" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "item_limit" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "amount" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "status" SET DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "status" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ALTER COLUMN "tier" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "attempts" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "verified" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "used" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "participant_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "participant_type" character varying(20)`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "purpose"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."verification_codes_purpose_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "purpose" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "type"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."verification_codes_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "type" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ALTER COLUMN "contact" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" DROP COLUMN "code"`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "code" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ALTER COLUMN "submission_count" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "status" character varying(50) DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "national_id_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "national_id_cloudinary_id" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "national_id_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "national_id_number" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_photo_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_photo_cloudinary_id" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_registration"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_registration" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "vehicle_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "vehicle_type" character varying(50)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "drivers_license_cloudinary_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "drivers_license_cloudinary_id" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "drivers_license_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD "drivers_license_number" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "balance" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "balance" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ALTER COLUMN "customer_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "status" character varying(50) DEFAULT 'completed'`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "description" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "UQ_4b3d5cb7b4480ca1c3c367ebb45"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "reference"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "reference" character varying(100) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_reference_key" UNIQUE ("reference")`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP COLUMN "transaction_type"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."wallet_transactions_transaction_type_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD "transaction_type" character varying(50) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ALTER COLUMN "customer_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "is_verified" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "wallet" SET DEFAULT '{"balance": 0, "pendingBalance": 0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ALTER COLUMN "wallet" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ALTER COLUMN "is_default" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "styles_tags"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "styles_tags" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "made_in_nigeria" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "rating" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "is_approved" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "colors"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "colors" text array`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "sizes"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "sizes" text array`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "gender"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "gender" character varying(20)`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "images"`);
    await queryRunner.query(`ALTER TABLE "products" ADD "images" text array`);
    await queryRunner.query(
      `ALTER TABLE "products" ALTER COLUMN "stock_quantity" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "name" character varying(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "icon" character varying(50)`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09"`
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "slug"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "slug" character varying(100) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug")`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying(100) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "vendors" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "vendors" ADD "address" character varying(500)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "vendor_of_month_count" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_verified_akwa_ibom" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_verified" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "is_approved" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "wallet" SET DEFAULT '{"balance": 0, "pendingBalance": 0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ALTER COLUMN "wallet" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "status" character varying DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_reference_key" UNIQUE ("reference")`
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "type" character varying NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "entity_id" uuid NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" DROP COLUMN "document_verification_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ADD "document_verification_status" character varying(50) DEFAULT 'not_submitted'`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_available" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_verified" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_active" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "is_approved" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "wallet" SET DEFAULT '{"balance": 0, "pendingBalance": 0}'`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ALTER COLUMN "wallet" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_phone"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_phone" character varying(20)`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_postal_code"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_postal_code" character varying(20)`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "delivery_state"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_state" character varying(100)`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivery_city"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "delivery_city" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_status"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_status" character varying(50) DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "payment_method"`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "payment_method" character varying(50) NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_status"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "order_status" character varying(50) DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "discount_amount" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "delivery_fee" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b"`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_number"`);
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "order_number" character varying(50) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number")`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "vendor_status"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_items_vendor_status_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "vendor_status" character varying(50) DEFAULT 'pending'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "vendor_id" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "color"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "color" character varying(50)`
    );
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "size"`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "size" character varying(10)`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "product_name" character varying(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP COLUMN "product_id"`
    );
    await queryRunner.query(`ALTER TABLE "order_items" ADD "product_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "order_items" ALTER COLUMN "order_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "updated_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "created_at" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "is_approved" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "rating" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "rating" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" SET DEFAULT 0.00`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ALTER COLUMN "total_sales" TYPE numeric(12,2)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_name" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_account_number"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_account_number" character varying(100)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "bank_account_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "bank_account_name" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "business_phone"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "business_phone" character varying(20)`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" DROP COLUMN "business_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "business_name" character varying(255) NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_vendor_id_key" UNIQUE ("vendor_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "serviceTypes"`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" DROP COLUMN "serviceCities"`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" DROP COLUMN "productIds"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "action_url"`
    );
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "read"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "data"`);
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "entity_type"`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN "entity_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "is_featured"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "share_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "view_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "comment_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "like_count"`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "product_id"`
    );
    await queryRunner.query(`ALTER TABLE "fashion_posts" DROP COLUMN "media"`);
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "postType"`
    );
    await queryRunner.query(`DROP TYPE "public"."fashion_posts_posttype_enum"`);
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" DROP COLUMN "caption"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" DROP COLUMN "productIds"`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" DROP COLUMN "partnershipType"`
    );
    await queryRunner.query(
      `DROP TYPE "public"."vendor_partnerships_partnershiptype_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "rating"`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" DROP COLUMN "total_deliveries"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "rider_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "vendor_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "customer_id"`
    );
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "service_types" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD "service_cities" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD "product_ids" jsonb NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "notifications" ADD "admin_id" uuid`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "rider_id" uuid`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "vendor_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "customer_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "is_read" boolean DEFAULT false`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD "reference_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "media_urls" text array DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "content" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "comments_count" integer DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "fashion_posts" ADD "likes_count" integer DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD "product_ids" jsonb`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD "partnership_type" character varying NOT NULL DEFAULT 'collaboration'`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "entity_type" character varying`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD "entity_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "wallet_balance" numeric(10,2) DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD "product_image" text`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD "tax_id" character varying(100)`
    );
    await queryRunner.query(`DROP TABLE "rider_location_history"`);
    await queryRunner.query(`DROP TABLE "models"`);
    await queryRunner.query(`DROP TABLE "news"`);
    await queryRunner.query(`DROP TABLE "cart"`);
    await queryRunner.query(`DROP TABLE "wishlist"`);
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_user_id_user_type_key" UNIQUE ("post_id", "user_id", "user_type")`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ADD CONSTRAINT "vendor_of_the_month_month_year_key" UNIQUE ("month", "year")`
    );
    await queryRunner.query(
      `ALTER TABLE "delivery_partners" ADD CONSTRAINT "delivery_partners_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "influencer_picks" ADD CONSTRAINT "influencer_picks_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'published'::character varying, 'archived'::character varying])::text[])))`
    );
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "notifications_single_user_check" CHECK (CHECK (((((
CASE
    WHEN (customer_id IS NOT NULL) THEN 1
    ELSE 0
END +
CASE
    WHEN (vendor_id IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (rider_id IS NOT NULL) THEN 1
    ELSE 0
END) +
CASE
    WHEN (admin_id IS NOT NULL) THEN 1
    ELSE 0
END) = 1)))`);
    await queryRunner.query(
      `ALTER TABLE "paystack_payment_methods" ADD CONSTRAINT "paystack_payment_methods_entity_type_check" CHECK (((entity_type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying, 'rider'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_type_check" CHECK (((user_type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_type_check" CHECK (((user_type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ADD CONSTRAINT "saved_locations_type_check" CHECK (((type)::text = ANY ((ARRAY['home'::character varying, 'work'::character varying, 'other'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "CHK_vendor_collaborations_status" CHECK (((status)::text = ANY ((ARRAY['proposed'::character varying, 'accepted'::character varying, 'active'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "vendor_collaborations_status_check" CHECK (((status)::text = ANY ((ARRAY['proposed'::character varying, 'accepted'::character varying, 'active'::character varying, 'completed'::character varying, 'rejected'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ADD CONSTRAINT "vendor_of_the_month_month_check" CHECK (((month >= 1) AND (month <= 12)))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "CHK_vendor_partnerships_status" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'declined'::character varying, 'active'::character varying, 'inactive'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "CHK_vendor_partnerships_type" CHECK (((partnership_type)::text = ANY ((ARRAY['collaboration'::character varying, 'supplier'::character varying, 'distributor'::character varying, 'joint_venture'::character varying, 'other'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "vendor_subscriptions_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying, 'pending'::character varying, 'past_due'::character varying, 'grace_period'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "vendor_subscriptions_tier_check" CHECK (((tier)::text = ANY ((ARRAY['free'::character varying, 'starter'::character varying, 'pro'::character varying, 'elite'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_entity_type_check" CHECK (((entity_type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying, 'rider'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_purpose_check" CHECK (((purpose)::text = ANY ((ARRAY['signup'::character varying, 'login'::character varying, 'password_reset'::character varying, 'phone_verification'::character varying, 'email_verification'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_type_check" CHECK (((type)::text = ANY ((ARRAY['sms'::character varying, 'email'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'changes_requested'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_transaction_type_check" CHECK (((transaction_type)::text = ANY ((ARRAY['deposit'::character varying, 'withdrawal'::character varying, 'refund'::character varying, 'payment'::character varying, 'commission'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "products_gender_check" CHECK (((gender)::text = ANY ((ARRAY['women'::character varying, 'men'::character varying, 'kids'::character varying, 'unisex'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "vendors" ADD CONSTRAINT "vendors_subscription_tier_check" CHECK (((subscription_tier)::text = ANY ((ARRAY['starter'::character varying, 'pro'::character varying, 'elite'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'processing'::character varying, 'cancelled'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_type_check" CHECK (((type)::text = ANY ((ARRAY['wallet_funding'::character varying, 'wallet_withdrawal'::character varying, 'order_payment'::character varying, 'refund'::character varying, 'commission'::character varying, 'transfer'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "transactions_entity_type_check" CHECK (((entity_type)::text = ANY ((ARRAY['customer'::character varying, 'vendor'::character varying, 'rider'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "riders" ADD CONSTRAINT "riders_document_verification_status_check" CHECK (((document_verification_status)::text = ANY ((ARRAY['not_submitted'::character varying, 'pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'changes_requested'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "orders_order_status_check" CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'processing'::character varying, 'shipped'::character varying, 'out_for_delivery'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_status_check" CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying])::text[])))`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_vendor_status_check" CHECK (((vendor_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'preparing'::character varying, 'ready'::character varying])::text[])))`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_cancellations_cancelled" ON "order_cancellations" ("cancelled_at", "cancelled_by") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_rejections_rejected" ON "order_rejections" ("rejected_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_methods_entity" ON "paystack_payment_methods" ("entity_id", "entity_type") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_likes_post" ON "post_likes" ("post_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fashion_posts_created" ON "fashion_posts" ("created_at") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_fashion_posts_vendor" ON "fashion_posts" ("vendor_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_post_comments_post" ON "post_comments" ("post_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_saved_locations_customer" ON "saved_locations" ("customer_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_status" ON "subscription_invoices" ("status") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_subscription" ON "subscription_invoices" ("subscriptionId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_subscription_invoices_vendor" ON "subscription_invoices" ("vendorId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_messages_conversation" ON "vendor_messages" ("receiver_id", "sender_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_messages_receiver" ON "vendor_messages" ("receiver_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_messages_sender" ON "vendor_messages" ("sender_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_partnerships_status" ON "vendor_partnerships" ("status") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_partnerships_recipient" ON "vendor_partnerships" ("recipient_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vendor_partnerships_requester" ON "vendor_partnerships" ("requester_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_verification_contact_used" ON "verification_codes" ("contact", "created_at", "used") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_verification_codes_contact" ON "verification_codes" ("contact") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_rider_documents_reviewed_by" ON "rider_documents" ("reviewed_by") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_rider_documents_status" ON "rider_documents" ("status") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_rider_documents_rider_id" ON "rider_documents" ("rider_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_wallet_transactions_wallet" ON "wallet_transactions" ("wallet_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_methods_authorization_code" ON "payment_methods" ("authorization_code") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_methods_customer_id" ON "payment_methods" ("customer_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_made_in_nigeria" ON "products" ("made_in_nigeria") WHERE (made_in_nigeria = true)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_gender" ON "products" ("gender") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_category" ON "products" ("category_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_vendor" ON "products" ("vendor_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vendors_subscription" ON "vendors" ("subscription_tier") WHERE (subscription_tier IS NOT NULL)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_status" ON "transactions" ("status") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_order" ON "transactions" ("order_id") WHERE (order_id IS NOT NULL)`
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_reference" ON "transactions" ("reference") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_transactions_entity" ON "transactions" ("entity_id", "entity_type") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_status" ON "orders" ("order_status") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_user" ON "orders" ("customer_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_order_items_order" ON "order_items" ("order_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_rejections" ADD CONSTRAINT "order_rejections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "fashion_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "fashion_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "saved_locations" ADD CONSTRAINT "saved_locations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_subscription_invoices_subscription" FOREIGN KEY ("subscriptionId") REFERENCES "vendor_subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_invoices" ADD CONSTRAINT "FK_subscription_invoices_vendor" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "FK_vendor_collaborations_vendor2" FOREIGN KEY ("vendor_2_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "FK_vendor_collaborations_vendor1" FOREIGN KEY ("vendor_1_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "vendor_collaborations_vendor_2_id_fkey" FOREIGN KEY ("vendor_2_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_collaborations" ADD CONSTRAINT "vendor_collaborations_vendor_1_id_fkey" FOREIGN KEY ("vendor_1_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD CONSTRAINT "FK_vendor_messages_receiver" FOREIGN KEY ("receiver_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_messages" ADD CONSTRAINT "FK_vendor_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_of_the_month" ADD CONSTRAINT "vendor_of_the_month_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "FK_vendor_partnerships_recipient" FOREIGN KEY ("recipient_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_partnerships" ADD CONSTRAINT "FK_vendor_partnerships_requester" FOREIGN KEY ("requester_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "FK_vendor_subscriptions_plan" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_subscriptions" ADD CONSTRAINT "vendor_subscriptions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "rider_documents" ADD CONSTRAINT "rider_documents_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallets" ADD CONSTRAINT "wallets_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "orders_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }
}
