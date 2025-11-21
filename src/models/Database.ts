import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string = './data/contracts.db') {
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables(): void {
    // Documents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        extracted_text TEXT,
        key_images TEXT, -- JSON array
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Properties table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        price REAL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        square_footage INTEGER,
        parcel_id TEXT,
        owner TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contract drafts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contract_drafts (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        property_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        fields TEXT NOT NULL, -- JSON array of ContractField
        extracted_text TEXT,
        llm_response TEXT, -- JSON object
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id),
        FOREIGN KEY (property_id) REFERENCES properties (id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_contract_drafts_document_id 
      ON contract_drafts (document_id);
      CREATE INDEX IF NOT EXISTS idx_contract_drafts_property_id 
      ON contract_drafts (property_id);
      CREATE INDEX IF NOT EXISTS idx_contract_drafts_status 
      ON contract_drafts (status);
    `);
  }

  // Document operations
  createDocument(doc: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO documents (id, filename, original_name, mime_type, size, extracted_text, key_images)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(doc.id, doc.filename, doc.originalName, doc.mimeType, doc.size, doc.extractedText, 
             JSON.stringify(doc.keyImages || []));
  }

  getDocument(id: string): any {
    const stmt = this.db.prepare('SELECT * FROM documents WHERE id = ?');
    const doc = stmt.get(id) as any;
    if (doc && doc.key_images) {
      doc.key_images = JSON.parse(doc.key_images);
    }
    return doc;
  }

  updateDocumentExtractedText(id: string, extractedText: string): void {
    const stmt = this.db.prepare('UPDATE documents SET extracted_text = ? WHERE id = ?');
    stmt.run(extractedText, id);
  }

  // Property operations
  createProperty(property: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO properties (id, address, price, bedrooms, bathrooms, square_footage, parcel_id, owner)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(property.id, property.address, property.price, property.bedrooms, 
             property.bathrooms, property.squareFootage, property.parcelId, property.owner);
  }

  getProperty(id: string): any {
    const stmt = this.db.prepare('SELECT * FROM properties WHERE id = ?');
    return stmt.get(id);
  }

  updateProperty(id: string, updates: any): void {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    const stmt = this.db.prepare(`UPDATE properties SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  // Contract draft operations
  createContractDraft(draft: any): void {
    const stmt = this.db.prepare(`
      INSERT INTO contract_drafts (id, document_id, property_id, status, fields, extracted_text, llm_response)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(draft.id, draft.documentId, draft.propertyId, draft.status, 
             JSON.stringify(draft.fields), draft.extractedText, JSON.stringify(draft.llmResponse));
  }

  getContractDraft(id: string): any {
    const stmt = this.db.prepare('SELECT * FROM contract_drafts WHERE id = ?');
    const draft = stmt.get(id) as any;
    if (draft) {
      draft.fields = JSON.parse(draft.fields);
      draft.llm_response = JSON.parse(draft.llm_response || '{}');
    }
    return draft;
  }

  updateContractDraft(id: string, updates: any): void {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates).map(v => typeof v === 'object' ? JSON.stringify(v) : v);
    const stmt = this.db.prepare(`UPDATE contract_drafts SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(...values, id);
  }

  getContractDraftsByDocument(documentId: string): any[] {
    const stmt = this.db.prepare('SELECT * FROM contract_drafts WHERE document_id = ? ORDER BY created_at DESC');
    const drafts = stmt.all(documentId);
    return drafts.map((draft: any) => {
      draft.fields = JSON.parse(draft.fields);
      draft.llm_response = JSON.parse(draft.llm_response || '{}');
      return draft;
    });
  }

  close(): void {
    this.db.close();
  }
}