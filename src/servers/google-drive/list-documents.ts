export interface DocumentMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: Date;
  modifiedTime: Date;
  owners: string[];
  shared: boolean;
  starred: boolean;
  trashed: boolean;
  webViewLink?: string;
}

export interface ListDocumentsOptions {
  query?: string;
  maxResults?: number;
  orderBy?: "createdTime" | "modifiedTime" | "name" | "quotaBytesUsed";
  pageToken?: string;
  includeShared?: boolean;
  includeStarred?: boolean;
}

export interface ListDocumentsResponse {
  documents: DocumentMetadata[];
  nextPageToken?: string;
  totalCount: number;
}

/**
 * Mock function to list Google Drive documents
 * @param options - Options for filtering and pagination
 * @returns List of documents matching the criteria
 */
export function listDocuments(
  options: ListDocumentsOptions = {}
): ListDocumentsResponse {
  const {
    query = "",
    maxResults = 10,
    orderBy = "modifiedTime",
    includeShared = true,
    includeStarred = true,
  } = options;

  // Mock document data
  const mockDocuments: DocumentMetadata[] = [
    {
      id: "1a2b3c4d5e6f7g8h9i0j",
      name: "Project Proposal 2025.docx",
      mimeType: "application/vnd.google-apps.document",
      size: 45632,
      createdTime: new Date("2025-01-15T10:30:00Z"),
      modifiedTime: new Date("2025-11-01T14:22:00Z"),
      owners: ["user@example.com"],
      shared: true,
      starred: false,
      trashed: false,
      webViewLink: "https://docs.google.com/document/d/1a2b3c4d5e6f7g8h9i0j",
    },
    {
      id: "2b3c4d5e6f7g8h9i0j1k",
      name: "Q4 Financial Report.xlsx",
      mimeType: "application/vnd.google-apps.spreadsheet",
      size: 128456,
      createdTime: new Date("2025-10-01T09:15:00Z"),
      modifiedTime: new Date("2025-10-30T16:45:00Z"),
      owners: ["admin@example.com"],
      shared: false,
      starred: true,
      trashed: false,
      webViewLink:
        "https://docs.google.com/spreadsheets/d/2b3c4d5e6f7g8h9i0j1k",
    },
    {
      id: "3c4d5e6f7g8h9i0j1k2l",
      name: "Team Meeting Notes.pdf",
      mimeType: "application/pdf",
      size: 892345,
      createdTime: new Date("2025-09-20T11:00:00Z"),
      modifiedTime: new Date("2025-10-25T10:30:00Z"),
      owners: ["team@example.com"],
      shared: true,
      starred: false,
      trashed: false,
      webViewLink: "https://drive.google.com/file/d/3c4d5e6f7g8h9i0j1k2l",
    },
    {
      id: "4d5e6f7g8h9i0j1k2l3m",
      name: "Marketing Strategy.pptx",
      mimeType: "application/vnd.google-apps.presentation",
      size: 2456789,
      createdTime: new Date("2025-08-10T13:20:00Z"),
      modifiedTime: new Date("2025-10-20T15:10:00Z"),
      owners: ["marketing@example.com"],
      shared: true,
      starred: true,
      trashed: false,
      webViewLink:
        "https://docs.google.com/presentation/d/4d5e6f7g8h9i0j1k2l3m",
    },
    {
      id: "5e6f7g8h9i0j1k2l3m4n",
      name: "Budget Template.xlsx",
      mimeType: "application/vnd.google-apps.spreadsheet",
      size: 67890,
      createdTime: new Date("2025-07-05T08:45:00Z"),
      modifiedTime: new Date("2025-10-15T12:00:00Z"),
      owners: ["finance@example.com"],
      shared: false,
      starred: false,
      trashed: false,
      webViewLink:
        "https://docs.google.com/spreadsheets/d/5e6f7g8h9i0j1k2l3m4n",
    },
    {
      id: "6f7g8h9i0j1k2l3m4n5o",
      name: "Product Roadmap 2026.docx",
      mimeType: "application/vnd.google-apps.document",
      size: 234567,
      createdTime: new Date("2025-06-12T14:30:00Z"),
      modifiedTime: new Date("2025-10-10T09:20:00Z"),
      owners: ["product@example.com"],
      shared: true,
      starred: true,
      trashed: false,
      webViewLink: "https://docs.google.com/document/d/6f7g8h9i0j1k2l3m4n5o",
    },
  ];

  // Filter documents based on options
  const filteredDocs = mockDocuments.filter((doc) => {
    if (!includeShared && doc.shared) return false;
    if (!includeStarred && doc.starred) return false;
    if (query && !doc.name.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
  });

  // Sort documents
  filteredDocs.sort((a, b) => {
    switch (orderBy) {
      case "createdTime":
        return b.createdTime.getTime() - a.createdTime.getTime();
      case "modifiedTime":
        return b.modifiedTime.getTime() - a.modifiedTime.getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "quotaBytesUsed":
        return b.size - a.size;
      default:
        return 0;
    }
  });

  // Paginate results
  const totalCount = filteredDocs.length;
  const paginatedDocs = filteredDocs.slice(0, maxResults);
  const hasMore = totalCount > maxResults;

  return {
    documents: paginatedDocs,
    nextPageToken: hasMore ? "mock-next-page-token" : undefined,
    totalCount,
  };
}
