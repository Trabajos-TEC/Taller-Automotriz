-- ==========================================
-- 4. VINCULAR CLIENTES CON TALLER
-- ==========================================
INSERT INTO clientes_talleres (cliente_id, taller_id)
SELECT c.id, 1
FROM clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM clientes_talleres ct 
    WHERE ct.cliente_id = c.id AND ct.taller_id = 1
)
LIMIT 150;

SELECT 'Clientes vinculados al taller: ' || COUNT(*)::TEXT FROM clientes_talleres;
