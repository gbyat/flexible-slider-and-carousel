<?php
/**
 * Post Loader Class
 *
 * Handles automatic loading of posts for the post-template functionality.
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FSC_Post_Loader class
 */
class FSC_Post_Loader {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_ajax_fsc_get_posts', array($this, 'get_posts_ajax'));
        add_action('wp_ajax_nopriv_fsc_get_posts', array($this, 'get_posts_ajax'));
    }
    
    /**
     * Get posts content for slider
     */
    public function get_posts_content($query_args, $post_elements) {
        // Sanitize query arguments
        $query_args = $this->sanitize_query_args($query_args);
        
        // Build WP_Query arguments
        $wp_query_args = $this->build_wp_query_args($query_args);
        
        // Execute query
        $query = new WP_Query($wp_query_args);
        
        if (!$query->have_posts()) {
            return $this->get_no_posts_message();
        }
        
        $content = '';
        
        while ($query->have_posts()) {
            $query->the_post();
            $content .= $this->build_post_content(get_the_ID(), $post_elements);
        }
        
        wp_reset_postdata();
        
        return $content;
    }
    
    /**
     * Get posts via AJAX
     */
    public function get_posts_ajax() {
        check_ajax_referer('fsc_frontend_nonce', 'nonce');
        
        $query_args = $_POST['query'] ?? array();
        $post_elements = $_POST['elements'] ?? array();
        
        if (empty($query_args)) {
            wp_send_json_error(__('No query parameters provided.', 'flexible-slider-carousel'));
        }
        
        $content = $this->get_posts_content($query_args, $post_elements);
        
        wp_send_json_success(array(
            'content' => $content,
            'found_posts' => $this->get_found_posts_count($query_args)
        ));
    }
    
    /**
     * Sanitize query arguments
     */
    private function sanitize_query_args($args) {
        $sanitized = array();
        
        // Post type
        if (isset($args['postType'])) {
            $sanitized['postType'] = sanitize_text_field($args['postType']);
        }
        
        // Posts per page
        if (isset($args['postsPerPage'])) {
            $sanitized['postsPerPage'] = intval($args['postsPerPage']);
        }
        
        // Order by
        if (isset($args['orderBy'])) {
            $allowed_orderby = array('date', 'title', 'menu_order', 'rand', 'comment_count', 'modified');
            $sanitized['orderBy'] = in_array($args['orderBy'], $allowed_orderby) ? $args['orderBy'] : 'date';
        }
        
        // Order
        if (isset($args['order'])) {
            $sanitized['order'] = strtoupper($args['order']) === 'ASC' ? 'ASC' : 'DESC';
        }
        
        // Categories
        if (isset($args['categories']) && is_array($args['categories'])) {
            $sanitized['categories'] = array_map('intval', $args['categories']);
        }
        
        // Tags
        if (isset($args['tags']) && is_array($args['tags'])) {
            $sanitized['tags'] = array_map('intval', $args['tags']);
        }
        
        // Include posts
        if (isset($args['include']) && is_array($args['include'])) {
            $sanitized['include'] = array_map('intval', $args['include']);
        }
        
        // Exclude posts
        if (isset($args['exclude']) && is_array($args['exclude'])) {
            $sanitized['exclude'] = array_map('intval', $args['exclude']);
        }
        
        // Meta query
        if (isset($args['metaQuery']) && is_array($args['metaQuery'])) {
            $sanitized['metaQuery'] = $this->sanitize_meta_query($args['metaQuery']);
        }
        
        // Tax query
        if (isset($args['taxQuery']) && is_array($args['taxQuery'])) {
            $sanitized['taxQuery'] = $this->sanitize_tax_query($args['taxQuery']);
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize meta query
     */
    private function sanitize_meta_query($meta_query) {
        $sanitized = array();
        
        foreach ($meta_query as $query) {
            if (isset($query['key']) && isset($query['value'])) {
                $sanitized[] = array(
                    'key' => sanitize_text_field($query['key']),
                    'value' => sanitize_text_field($query['value']),
                    'compare' => isset($query['compare']) ? sanitize_text_field($query['compare']) : '=',
                    'type' => isset($query['type']) ? sanitize_text_field($query['type']) : 'CHAR'
                );
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize tax query
     */
    private function sanitize_tax_query($tax_query) {
        $sanitized = array();
        
        foreach ($tax_query as $query) {
            if (isset($query['taxonomy']) && isset($query['terms'])) {
                $sanitized[] = array(
                    'taxonomy' => sanitize_text_field($query['taxonomy']),
                    'terms' => is_array($query['terms']) ? array_map('intval', $query['terms']) : intval($query['terms']),
                    'field' => isset($query['field']) ? sanitize_text_field($query['field']) : 'term_id',
                    'operator' => isset($query['operator']) ? sanitize_text_field($query['operator']) : 'IN'
                );
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Build WP_Query arguments
     */
    private function build_wp_query_args($query_args) {
        $wp_query_args = array(
            'post_type' => $query_args['postType'] ?? 'post',
            'posts_per_page' => $query_args['postsPerPage'] ?? 10,
            'orderby' => $query_args['orderBy'] ?? 'date',
            'order' => $query_args['order'] ?? 'DESC',
            'post_status' => 'publish',
            'suppress_filters' => false
        );
        
        // Categories
        if (!empty($query_args['categories'])) {
            $wp_query_args['category__in'] = $query_args['categories'];
        }
        
        // Tags
        if (!empty($query_args['tags'])) {
            $wp_query_args['tag__in'] = $query_args['tags'];
        }
        
        // Include posts
        if (!empty($query_args['include'])) {
            $wp_query_args['post__in'] = $query_args['include'];
        }
        
        // Exclude posts
        if (!empty($query_args['exclude'])) {
            $wp_query_args['post__not_in'] = $query_args['exclude'];
        }
        
        // Meta query
        if (!empty($query_args['metaQuery'])) {
            $wp_query_args['meta_query'] = $query_args['metaQuery'];
        }
        
        // Tax query
        if (!empty($query_args['taxQuery'])) {
            $wp_query_args['tax_query'] = $query_args['taxQuery'];
        }
        
        return $wp_query_args;
    }
    
    /**
     * Build post content
     */
    private function build_post_content($post_id, $post_elements) {
        $content = '<div class="fsc-post-frame" data-post-id="' . esc_attr($post_id) . '">';
        
        // Featured image
        if (!empty($post_elements['featuredImage']) && has_post_thumbnail($post_id)) {
            $content .= $this->build_featured_image($post_id);
        }
        
        // Title
        if (!empty($post_elements['title'])) {
            $content .= $this->build_post_title($post_id);
        }
        
        // Excerpt
        if (!empty($post_elements['excerpt'])) {
            $content .= $this->build_post_excerpt($post_id);
        }
        
        // Meta information
        if (!empty($post_elements['meta'])) {
            $content .= $this->build_post_meta($post_id, $post_elements);
        }
        
        // Author
        if (!empty($post_elements['author'])) {
            $content .= $this->build_post_author($post_id);
        }
        
        // Categories
        if (!empty($post_elements['categories'])) {
            $content .= $this->build_post_categories($post_id);
        }
        
        // Tags
        if (!empty($post_elements['tags'])) {
            $content .= $this->build_post_tags($post_id);
        }
        
        // Custom fields
        if (!empty($post_elements['customFields'])) {
            $content .= $this->build_custom_fields($post_id, $post_elements['customFields']);
        }
        
        $content .= '</div>';
        
        return $content;
    }
    
    /**
     * Build featured image
     */
    private function build_featured_image($post_id) {
        $image_id = get_post_thumbnail_id($post_id);
        $image_url = wp_get_attachment_image_url($image_id, 'medium');
        $image_alt = get_post_meta($image_id, '_wp_attachment_image_alt', true);
        
        if (!$image_url) {
            return '';
        }
        
        return sprintf(
            '<div class="fsc-post-frame__image">
                <img src="%s" alt="%s" loading="lazy" />
            </div>',
            esc_url($image_url),
            esc_attr($image_alt ?: get_the_title($post_id))
        );
    }
    
    /**
     * Build post title
     */
    private function build_post_title($post_id) {
        $title = get_the_title($post_id);
        
        return sprintf(
            '<h3 class="fsc-post-frame__title">
                <a href="%s">%s</a>
            </h3>',
            esc_url(get_permalink($post_id)),
            esc_html($title)
        );
    }
    
    /**
     * Build post excerpt
     */
    private function build_post_excerpt($post_id) {
        $excerpt = get_the_excerpt($post_id);
        
        if (empty($excerpt)) {
            $post = get_post($post_id);
            $excerpt = wp_trim_words($post->post_content, 20, '...');
        }
        
        return sprintf(
            '<div class="fsc-post-frame__excerpt">
                %s
            </div>',
            wp_kses_post($excerpt)
        );
    }
    
    /**
     * Build post meta
     */
    private function build_post_meta($post_id, $post_elements) {
        $meta = '<div class="fsc-post-frame__meta">';
        
        // Date
        if (!empty($post_elements['date'])) {
            $meta .= sprintf(
                '<span class="fsc-post-frame__date">%s</span>',
                esc_html(get_the_date('', $post_id))
            );
        }
        
        // Comments count
        $comments_count = get_comments_number($post_id);
        if ($comments_count > 0) {
            $meta .= sprintf(
                '<span class="fsc-post-frame__comments">%s</span>',
                sprintf(
                    _n('%s comment', '%s comments', $comments_count, 'flexible-slider-carousel'),
                    number_format_i18n($comments_count)
                )
            );
        }
        
        $meta .= '</div>';
        
        return $meta;
    }
    
    /**
     * Build post author
     */
    private function build_post_author($post_id) {
        $author_id = get_post_field('post_author', $post_id);
        $author_name = get_the_author_meta('display_name', $author_id);
        $author_url = get_author_posts_url($author_id);
        
        return sprintf(
            '<div class="fsc-post-frame__author">
                <span class="fsc-post-frame__author-label">%s:</span>
                <a href="%s" class="fsc-post-frame__author-link">%s</a>
            </div>',
            esc_html__('By', 'flexible-slider-carousel'),
            esc_url($author_url),
            esc_html($author_name)
        );
    }
    
    /**
     * Build post categories
     */
    private function build_post_categories($post_id) {
        $categories = get_the_category($post_id);
        
        if (empty($categories)) {
            return '';
        }
        
        $category_links = array();
        foreach ($categories as $category) {
            $category_links[] = sprintf(
                '<a href="%s" class="fsc-post-frame__category">%s</a>',
                esc_url(get_category_link($category->term_id)),
                esc_html($category->name)
            );
        }
        
        return sprintf(
            '<div class="fsc-post-frame__categories">
                <span class="fsc-post-frame__categories-label">%s:</span>
                %s
            </div>',
            esc_html__('Categories', 'flexible-slider-carousel'),
            implode(', ', $category_links)
        );
    }
    
    /**
     * Build post tags
     */
    private function build_post_tags($post_id) {
        $tags = get_the_tags($post_id);
        
        if (empty($tags)) {
            return '';
        }
        
        $tag_links = array();
        foreach ($tags as $tag) {
            $tag_links[] = sprintf(
                '<a href="%s" class="fsc-post-frame__tag">%s</a>',
                esc_url(get_tag_link($tag->term_id)),
                esc_html($tag->name)
            );
        }
        
        return sprintf(
            '<div class="fsc-post-frame__tags">
                <span class="fsc-post-frame__tags-label">%s:</span>
                %s
            </div>',
            esc_html__('Tags', 'flexible-slider-carousel'),
            implode(', ', $tag_links)
        );
    }
    
    /**
     * Build custom fields
     */
    private function build_custom_fields($post_id, $custom_fields) {
        if (!function_exists('get_field')) {
            return '';
        }
        
        $content = '';
        
        foreach ($custom_fields as $field) {
            $field_value = get_field($field['name'], $post_id);
            
            if ($field_value) {
                $content .= sprintf(
                    '<div class="fsc-post-frame__custom-field">
                        <span class="fsc-post-frame__custom-field-label">%s:</span>
                        <span class="fsc-post-frame__custom-field-value">%s</span>
                    </div>',
                    esc_html($field['label']),
                    esc_html($field_value)
                );
            }
        }
        
        if ($content) {
            return '<div class="fsc-post-frame__custom-fields">' . $content . '</div>';
        }
        
        return '';
    }
    
    /**
     * Get no posts message
     */
    private function get_no_posts_message() {
        return sprintf(
            '<div class="fsc-no-posts">
                <p>%s</p>
            </div>',
            esc_html__('No posts found matching your criteria.', 'flexible-slider-carousel')
        );
    }
    
    /**
     * Get found posts count
     */
    private function get_found_posts_count($query_args) {
        $wp_query_args = $this->build_wp_query_args($query_args);
        $query = new WP_Query($wp_query_args);
        
        $count = $query->found_posts;
        wp_reset_postdata();
        
        return $count;
    }
    
    /**
     * Get available post types
     */
    public function get_available_post_types() {
        $post_types = get_post_types(array('public' => true), 'objects');
        $result = array();
        
        foreach ($post_types as $post_type) {
            $result[] = array(
                'value' => $post_type->name,
                'label' => $post_type->labels->singular_name,
                'supports' => get_all_post_type_supports($post_type->name)
            );
        }
        
        return $result;
    }
    
    /**
     * Get available taxonomies
     */
    public function get_available_taxonomies() {
        $taxonomies = get_taxonomies(array('public' => true), 'objects');
        $result = array();
        
        foreach ($taxonomies as $taxonomy) {
            $result[] = array(
                'value' => $taxonomy->name,
                'label' => $taxonomy->labels->singular_name,
                'object_type' => $taxonomy->object_type
            );
        }
        
        return $result;
    }
    
    /**
     * Get available meta fields
     */
    public function get_available_meta_fields() {
        global $wpdb;
        
        $meta_keys = $wpdb->get_col(
            "SELECT DISTINCT meta_key FROM {$wpdb->postmeta} 
             WHERE meta_key NOT LIKE '_%' 
             ORDER BY meta_key ASC"
        );
        
        $result = array();
        foreach ($meta_keys as $meta_key) {
            $result[] = array(
                'value' => $meta_key,
                'label' => ucwords(str_replace('_', ' ', $meta_key))
            );
        }
        
        return $result;
    }
    
    /**
     * Get ACF fields for post type
     */
    public function get_acf_fields_for_post_type($post_type) {
        if (!function_exists('acf_get_field_groups')) {
            return array();
        }
        
        $field_groups = acf_get_field_groups(array('post_type' => $post_type));
        $fields = array();
        
        foreach ($field_groups as $field_group) {
            $group_fields = acf_get_fields($field_group);
            if ($group_fields) {
                foreach ($group_fields as $field) {
                    $fields[] = array(
                        'value' => $field['name'],
                        'label' => $field['label'],
                        'type' => $field['type'],
                        'required' => !empty($field['required'])
                    );
                }
            }
        }
        
        return $fields;
    }
    
    /**
     * Update post view count
     */
    public function update_post_view_count($post_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'fsc_slider_stats';
        
        // Check if record exists
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table_name WHERE post_id = %d",
            $post_id
        ));
        
        if ($existing) {
            // Update existing record
            $wpdb->update(
                $table_name,
                array('views' => $wpdb->get_var($wpdb->prepare(
                    "SELECT views + 1 FROM $table_name WHERE post_id = %d",
                    $post_id
                ))),
                array('post_id' => $post_id),
                array('%d'),
                array('%d')
            );
        } else {
            // Insert new record
            $wpdb->insert(
                $table_name,
                array(
                    'slider_id' => 'post-' . $post_id,
                    'post_id' => $post_id,
                    'views' => 1
                ),
                array('%s', '%d', '%d')
            );
        }
    }
} 