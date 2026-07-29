-- Migration: add_finance_modules
-- Módulos: Gastos, Bancos, Caja Chica

-- ─── Categorías de Gasto ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "ExpenseCategory" (
  "Id"        SERIAL PRIMARY KEY,
  "CompanyId" INTEGER NOT NULL DEFAULT 1,
  "Name"      VARCHAR(100) NOT NULL,
  "Color"     VARCHAR(7),
  "IsActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_ExpenseCategory_Company" FOREIGN KEY ("CompanyId")
    REFERENCES "Company"("Id") ON UPDATE NO ACTION,
  CONSTRAINT "UQ_ExpenseCategory_Company_Name" UNIQUE ("CompanyId", "Name")
);

CREATE INDEX IF NOT EXISTS "IX_ExpenseCategory_Company"
  ON "ExpenseCategory" ("CompanyId", "IsActive");

-- ─── Cuentas Bancarias ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BankAccount" (
  "Id"             SERIAL PRIMARY KEY,
  "CompanyId"      INTEGER NOT NULL DEFAULT 1,
  "AccountName"    VARCHAR(150) NOT NULL,
  "BankName"       VARCHAR(100) NOT NULL,
  "AccountNumber"  VARCHAR(50),
  "AccountType"    VARCHAR(20) NOT NULL DEFAULT 'CHECKING',
  "Currency"       VARCHAR(3) NOT NULL DEFAULT 'DOP',
  "CurrentBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "IsActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "Notes"          VARCHAR(250),
  "CreatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "UpdatedAt"      TIMESTAMPTZ,
  CONSTRAINT "FK_BankAccount_Company" FOREIGN KEY ("CompanyId")
    REFERENCES "Company"("Id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "IX_BankAccount_Company"
  ON "BankAccount" ("CompanyId", "IsActive");

-- ─── Transacciones Bancarias ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "BankTransaction" (
  "Id"              SERIAL PRIMARY KEY,
  "BankAccountId"   INTEGER NOT NULL,
  "TransactionType" VARCHAR(20) NOT NULL,
  "Amount"          DECIMAL(18,2) NOT NULL,
  "BalanceAfter"    DECIMAL(18,2) NOT NULL,
  "Description"     VARCHAR(250) NOT NULL,
  "Reference"       VARCHAR(100),
  "TransactionDate" DATE NOT NULL,
  "Category"        VARCHAR(50),
  "Notes"           VARCHAR(250),
  "CreatedBy"       VARCHAR(150),
  "CreatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_BankTransaction_Account" FOREIGN KEY ("BankAccountId")
    REFERENCES "BankAccount"("Id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "IX_BankTransaction_Account_Date"
  ON "BankTransaction" ("BankAccountId", "TransactionDate" DESC);

-- ─── Fondo de Caja Chica ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PettyCashFund" (
  "Id"             SERIAL PRIMARY KEY,
  "CompanyId"      INTEGER NOT NULL DEFAULT 1,
  "Name"           VARCHAR(100) NOT NULL,
  "FundLimit"      DECIMAL(18,2) NOT NULL,
  "CurrentBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "Custodian"      VARCHAR(150),
  "IsActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "CreatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "UpdatedAt"      TIMESTAMPTZ,
  CONSTRAINT "FK_PettyCashFund_Company" FOREIGN KEY ("CompanyId")
    REFERENCES "Company"("Id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "IX_PettyCashFund_Company"
  ON "PettyCashFund" ("CompanyId", "IsActive");

-- ─── Transacciones de Caja Chica ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PettyCashTransaction" (
  "Id"                SERIAL PRIMARY KEY,
  "PettyCashFundId"   INTEGER NOT NULL,
  "TransactionType"   VARCHAR(20) NOT NULL,
  "Amount"            DECIMAL(18,2) NOT NULL,
  "BalanceAfter"      DECIMAL(18,2) NOT NULL,
  "Description"       VARCHAR(250) NOT NULL,
  "TransactionDate"   DATE NOT NULL,
  "ReceiptUrl"        VARCHAR(500),
  "Notes"             VARCHAR(250),
  "CreatedBy"         VARCHAR(150),
  "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "FK_PettyCashTransaction_Fund" FOREIGN KEY ("PettyCashFundId")
    REFERENCES "PettyCashFund"("Id") ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "IX_PettyCashTransaction_Fund_Date"
  ON "PettyCashTransaction" ("PettyCashFundId", "TransactionDate" DESC);

-- ─── Gastos ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Expense" (
  "Id"                      SERIAL PRIMARY KEY,
  "CompanyId"               INTEGER NOT NULL DEFAULT 1,
  "ExpenseNumber"           INTEGER NOT NULL,
  "CategoryId"              INTEGER NOT NULL,
  "Description"             VARCHAR(250) NOT NULL,
  "Amount"                  DECIMAL(18,2) NOT NULL,
  "ExpenseDate"             DATE NOT NULL,
  "Supplier"                VARCHAR(150),
  "Reference"               VARCHAR(100),
  "Notes"                   VARCHAR(500),
  "PaymentMethod"           VARCHAR(30),
  "ReceiptUrl"              VARCHAR(500),
  "BankAccountId"           INTEGER,
  "PettyCashTransactionId"  INTEGER,
  "Status"                  VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
  "CreatedBy"               VARCHAR(150),
  "CreatedAt"               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "UpdatedAt"               TIMESTAMPTZ,
  CONSTRAINT "FK_Expense_Category" FOREIGN KEY ("CategoryId")
    REFERENCES "ExpenseCategory"("Id") ON UPDATE NO ACTION,
  CONSTRAINT "FK_Expense_Company" FOREIGN KEY ("CompanyId")
    REFERENCES "Company"("Id") ON UPDATE NO ACTION,
  CONSTRAINT "FK_Expense_BankAccount" FOREIGN KEY ("BankAccountId")
    REFERENCES "BankAccount"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "FK_Expense_PettyCash" FOREIGN KEY ("PettyCashTransactionId")
    REFERENCES "PettyCashTransaction"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT "UQ_Expense_Company_Number" UNIQUE ("CompanyId", "ExpenseNumber")
);

CREATE INDEX IF NOT EXISTS "IX_Expense_Company_Date"
  ON "Expense" ("CompanyId", "ExpenseDate" DESC);

CREATE INDEX IF NOT EXISTS "IX_Expense_Category"
  ON "Expense" ("CategoryId");

CREATE INDEX IF NOT EXISTS "IX_Expense_BankAccount"
  ON "Expense" ("BankAccountId");

-- ─── Seed: Categorías de gasto por defecto ──────────────────────────────────

INSERT INTO "ExpenseCategory" ("CompanyId", "Name", "Color") VALUES
  (1, 'Comida y bebidas', '#f59e0b'),
  (1, 'Combustible', '#ef4444'),
  (1, 'Suministros de oficina', '#3b82f6'),
  (1, 'Herramientas', '#8b5cf6'),
  (1, 'Servicios públicos', '#06b6d4'),
  (1, 'Alquiler', '#ec4899'),
  (1, 'Mantenimiento', '#10b981'),
  (1, 'Transporte', '#f97316'),
  (1, 'Misceláneos', '#6b7280')
ON CONFLICT ("CompanyId", "Name") DO NOTHING;
