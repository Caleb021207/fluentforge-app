import { describe, expect, it } from "vitest";
import { sanitizeFilename, validateBase64Image, validateFile } from "./fileValidation";

/**
 * CHARACTERIZATION — protected assessment flow, client-side validation.
 *
 * These tests pin the CURRENT behavior of the upload validator (plan 12 §T0,
 * invariants P1–P8). They deliberately document defect F1.1's client half:
 * the client ACCEPTS application/pdf while the analyze-transcript edge
 * function today rejects anything that isn't `data:image/…` [observed,
 * wip-12a]. The 0.8 fix changes the SERVER to accept PDFs — this client
 * contract must keep passing unchanged.
 */

const makeFile = (name: string, type: string, sizeBytes = 1024): File => {
  const blob = new Blob([new Uint8Array(Math.min(sizeBytes, 1024))], { type });
  const file = new File([blob], name, { type });
  // File size is derived from content; for the >5MB case override via
  // Object.defineProperty so we don't allocate 6MB in tests.
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
};

describe("validateFile (characterization)", () => {
  it("accepts every documented image type", () => {
    for (const type of ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]) {
      expect(validateFile(makeFile("scan.img", type)).valid).toBe(true);
    }
  });

  it("accepts PDF and Word documents — the client half of the protected flow contract", () => {
    expect(validateFile(makeFile("transcript.pdf", "application/pdf")).valid).toBe(true);
    expect(validateFile(makeFile("t.doc", "application/msword")).valid).toBe(true);
    expect(
      validateFile(
        makeFile(
          "t.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ),
      ).valid,
    ).toBe(true);
  });

  it("rejects files over the 5MB limit with the documented message", () => {
    const res = validateFile(makeFile("big.pdf", "application/pdf", 5 * 1024 * 1024 + 1));
    expect(res.valid).toBe(false);
    expect(res.error).toBe("File size exceeds 5MB limit");
  });

  it("accepts a file at exactly the 5MB boundary", () => {
    expect(validateFile(makeFile("edge.pdf", "application/pdf", 5 * 1024 * 1024)).valid).toBe(true);
  });

  it("rejects filenames longer than 255 characters", () => {
    const res = validateFile(makeFile("a".repeat(256) + ".pdf", "application/pdf"));
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Filename exceeds 255 character limit");
  });

  it("rejects dangerous executable extensions even with an allowed MIME type", () => {
    for (const name of ["evil.exe", "evil.bat", "evil.js", "evil.php", "EVIL.EXE"]) {
      const res = validateFile(makeFile(name, "application/pdf"));
      expect(res.valid).toBe(false);
      expect(res.error).toBe("File type not allowed");
    }
  });

  it("rejects unsupported MIME types (text, svg, zip)", () => {
    for (const type of ["text/plain", "image/svg+xml", "application/zip"]) {
      const res = validateFile(makeFile("f.bin", type));
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/File type not supported/);
    }
  });
});

describe("sanitizeFilename (characterization)", () => {
  it("neutralizes path traversal and reserved characters", () => {
    // Actual output keeps interior dots after separators are replaced —
    // traversal is neutralized because every '/' becomes '_', even though
    // the residue looks odd. Pinned as-is [observed].
    expect(sanitizeFilename("../../etc/passwd")).toBe("_.._etc_passwd");
    expect(sanitizeFilename("a\\b:c*d?e\"f<g>h|i.pdf")).toBe("a_b_c_d_e_f_g_h_i.pdf");
  });

  it("strips leading/trailing dots and spaces", () => {
    expect(sanitizeFilename("  .hidden.pdf. ")).toBe("hidden.pdf");
  });

  it("falls back to uploaded_file when nothing survives", () => {
    expect(sanitizeFilename("...")).toBe("uploaded_file");
    expect(sanitizeFilename("")).toBe("uploaded_file");
  });
});

describe("validateBase64Image (characterization)", () => {
  it("accepts an allowed image data URL", () => {
    expect(validateBase64Image("data:image/png;base64,iVBORw0KGgo=").valid).toBe(true);
  });

  it("rejects non-image data URLs — the server-side shape of defect F1.1", () => {
    // The analyze-transcript edge function performs this same prefix check
    // [observed wip-12a §upload]; a PDF data URL fails it today.
    const res = validateBase64Image("data:application/pdf;base64,JVBERi0=");
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Invalid image data format");
  });

  it("rejects disallowed image subtypes", () => {
    const res = validateBase64Image("data:image/svg+xml;base64,PHN2Zz4=");
    expect(res.valid).toBe(false);
    expect(res.error).toBe("Image type not allowed");
  });
});
