CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_user_id_unique UNIQUE (user_id),
    CONSTRAINT employees_employee_code_unique UNIQUE (employee_code),
    CONSTRAINT employees_user_id_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT employees_code_not_blank CHECK (length(btrim(employee_code)) > 0),
    CONSTRAINT employees_first_name_not_blank CHECK (length(btrim(first_name)) > 0),
    CONSTRAINT employees_last_name_not_blank CHECK (length(btrim(last_name)) > 0),
    CONSTRAINT employees_department_not_blank CHECK (length(btrim(department)) > 0)
);

CREATE TRIGGER trg_employees_set_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
