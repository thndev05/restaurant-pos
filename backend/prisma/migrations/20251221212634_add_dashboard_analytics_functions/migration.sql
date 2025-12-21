-- =============================================
-- Dashboard Analytics Stored Functions
-- =============================================

-- Function 1: Get Revenue Statistics by Date Range
CREATE OR REPLACE FUNCTION get_revenue_stats(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_orders BIGINT,
    avg_order_value DECIMAL,
    total_items_sold BIGINT,
    total_customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        COUNT(DISTINCT p.order_id) as total_orders,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold,
        COUNT(DISTINCT o.customer_phone) FILTER (WHERE o.customer_phone IS NOT NULL) as total_customers
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get Daily Revenue Breakdown
CREATE OR REPLACE FUNCTION get_daily_revenue(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    date DATE,
    revenue DECIMAL,
    orders BIGINT,
    items_sold BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(p.payment_time) as date,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COUNT(DISTINCT p.order_id) as orders,
        COALESCE(SUM(oi.quantity), 0) as items_sold
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
    GROUP BY DATE(p.payment_time)
    ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get Best Selling Items
CREATE OR REPLACE FUNCTION get_best_selling_items(
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    item_image TEXT,
    quantity_sold BIGINT,
    total_revenue DECIMAL,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id as item_id,
        mi.name::TEXT as item_name,
        mi.image::TEXT as item_image,
        SUM(oi.quantity) as quantity_sold,
        SUM(oi.quantity * oi.price_at_order) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN orders o ON oi.order_id = o.id
    JOIN payments p ON o.id = p.order_id
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
        AND oi.status != 'CANCELLED'
    GROUP BY mi.id, mi.name, mi.image
    ORDER BY quantity_sold DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Get Category Performance
CREATE OR REPLACE FUNCTION get_category_performance(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    items_sold BIGINT,
    revenue DECIMAL,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as category_id,
        c.name::TEXT as category_name,
        SUM(oi.quantity) as items_sold,
        SUM(oi.quantity * oi.price_at_order) as revenue,
        COUNT(DISTINCT oi.order_id) as order_count
    FROM order_items oi
    JOIN menu_items mi ON oi.menu_item_id = mi.id
    JOIN categories c ON mi.category_id = c.id
    JOIN orders o ON oi.order_id = o.id
    JOIN payments p ON o.id = p.order_id
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
        AND oi.status != 'CANCELLED'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Get Hourly Sales Distribution
CREATE OR REPLACE FUNCTION get_hourly_sales(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    hour INT,
    revenue DECIMAL,
    order_count BIGINT,
    avg_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM p.payment_time)::INT as hour,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COUNT(DISTINCT p.order_id) as order_count,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
    FROM payments p
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
    GROUP BY EXTRACT(HOUR FROM p.payment_time)
    ORDER BY hour ASC;
END;
$$ LANGUAGE plpgsql;

-- Function 6: Get Payment Method Statistics
CREATE OR REPLACE FUNCTION get_payment_method_stats(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    payment_method TEXT,
    transaction_count BIGINT,
    total_amount DECIMAL,
    percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH payment_totals AS (
        SELECT 
            p.payment_method::TEXT as method,
            COUNT(*) as txn_count,
            COALESCE(SUM(p.total_amount), 0) as amount
        FROM payments p
        WHERE p.status = 'SUCCESS'
            AND p.payment_time >= start_date 
            AND p.payment_time <= end_date
        GROUP BY p.payment_method
    ),
    grand_total AS (
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payment_totals
    )
    SELECT 
        pt.method::TEXT as payment_method,
        pt.txn_count as transaction_count,
        pt.amount as total_amount,
        CASE 
            WHEN gt.total > 0 THEN ROUND((pt.amount / gt.total * 100), 2)
            ELSE 0 
        END as percentage
    FROM payment_totals pt
    CROSS JOIN grand_total gt
    ORDER BY pt.amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 7: Get Order Type Distribution
CREATE OR REPLACE FUNCTION get_order_type_stats(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    order_type TEXT,
    order_count BIGINT,
    total_revenue DECIMAL,
    avg_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.order_type::TEXT,
        COUNT(*) as order_count,
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
    FROM orders o
    JOIN payments p ON o.id = p.order_id
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
    GROUP BY o.order_type
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 8: Get Table Utilization Stats
CREATE OR REPLACE FUNCTION get_table_utilization_stats(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    table_id UUID,
    table_number INT,
    session_count BIGINT,
    total_revenue DECIMAL,
    avg_session_duration INTERVAL,
    total_customers INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as table_id,
        t.number as table_number,
        COUNT(DISTINCT ts.id) as session_count,
        COALESCE(SUM(p.total_amount), 0) as total_revenue,
        AVG(ts.end_time - ts.start_time) as avg_session_duration,
        COALESCE(SUM(ts.customer_count), 0)::INT as total_customers
    FROM tables t
    LEFT JOIN table_sessions ts ON t.id = ts.table_id
    LEFT JOIN payments p ON ts.id = p.session_id
    WHERE ts.start_time >= start_date 
        AND ts.start_time <= end_date
        AND ts.status = 'CLOSED'
    GROUP BY t.id, t.number
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 9: Get Peak Hours Analysis
CREATE OR REPLACE FUNCTION get_peak_hours_analysis(
    start_date TIMESTAMP,
    end_date TIMESTAMP
)
RETURNS TABLE (
    time_period TEXT,
    order_count BIGINT,
    revenue DECIMAL,
    avg_order_value DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 6 AND 11 THEN 'Breakfast (6-11)'
            WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 12 AND 14 THEN 'Lunch (12-14)'
            WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 15 AND 17 THEN 'Afternoon (15-17)'
            WHEN EXTRACT(HOUR FROM p.payment_time) BETWEEN 18 AND 22 THEN 'Dinner (18-22)'
            ELSE 'Late Night (23-5)'
        END as time_period,
        COUNT(*) as order_count,
        COALESCE(SUM(p.total_amount), 0) as revenue,
        COALESCE(AVG(p.total_amount), 0) as avg_order_value
    FROM payments p
    WHERE p.status = 'SUCCESS'
        AND p.payment_time >= start_date 
        AND p.payment_time <= end_date
    GROUP BY time_period
    ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 10: Get Revenue Comparison
CREATE OR REPLACE FUNCTION get_revenue_comparison(
    current_start TIMESTAMP,
    current_end TIMESTAMP,
    previous_start TIMESTAMP,
    previous_end TIMESTAMP
)
RETURNS TABLE (
    current_revenue DECIMAL,
    previous_revenue DECIMAL,
    revenue_change DECIMAL,
    revenue_change_percent DECIMAL,
    current_orders BIGINT,
    previous_orders BIGINT,
    order_change BIGINT,
    order_change_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT 
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
        FROM payments
        WHERE status = 'SUCCESS'
            AND payment_time >= current_start 
            AND payment_time <= current_end
    ),
    previous_period AS (
        SELECT 
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
        FROM payments
        WHERE status = 'SUCCESS'
            AND payment_time >= previous_start 
            AND payment_time <= previous_end
    )
    SELECT 
        cp.revenue as current_revenue,
        pp.revenue as previous_revenue,
        (cp.revenue - pp.revenue) as revenue_change,
        CASE 
            WHEN pp.revenue > 0 THEN ROUND(((cp.revenue - pp.revenue) / pp.revenue * 100), 2)
            ELSE 0 
        END as revenue_change_percent,
        cp.orders as current_orders,
        pp.orders as previous_orders,
        (cp.orders - pp.orders) as order_change,
        CASE 
            WHEN pp.orders > 0 THEN ROUND((((cp.orders - pp.orders)::DECIMAL / pp.orders) * 100), 2)
            ELSE 0 
        END as order_change_percent
    FROM current_period cp
    CROSS JOIN previous_period pp;
END;
$$ LANGUAGE plpgsql;
