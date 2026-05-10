// Generates a shareable PNG image of an ayah using Canvas, then triggers
// Web Share API (with file) or falls back to download.

interface AyahShareInput {
  text: string;
  surahName: string;
  ayahNumber: number;
}

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export const generateAyahImage = async ({
  text,
  surahName,
  ayahNumber,
}: AyahShareInput): Promise<Blob | null> => {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#064E3B');
  grad.addColorStop(0.5, '#0a6b53');
  grad.addColorStop(1, '#022c22');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Decorative frame
  ctx.strokeStyle = 'rgba(212,175,87,0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(50, 50, W - 100, H - 100);
  ctx.strokeStyle = 'rgba(212,175,87,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(70, 70, W - 140, H - 140);

  // Title
  ctx.fillStyle = '#D4AF57';
  ctx.font = 'bold 44px "Amiri", "IBM Plex Sans Arabic", serif';
  ctx.textAlign = 'center';
  ctx.fillText('﴿ القرآن الكريم ﴾', W / 2, 170);

  // Ayah text (wrapped)
  ctx.fillStyle = '#FFF8E7';
  ctx.font = '54px "Amiri", serif';
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  const maxWidth = W - 220;
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = 92;
  const totalH = lines.length * lineHeight;
  let y = (H - totalH) / 2 + 30;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  // Ayah marker
  ctx.fillStyle = '#D4AF57';
  ctx.font = 'bold 36px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText(`﴿ ${surahName} - آية ${ayahNumber} ﴾`, W / 2, H - 160);

  // Footer
  ctx.fillStyle = 'rgba(255,248,231,0.55)';
  ctx.font = '26px "IBM Plex Sans Arabic", sans-serif';
  ctx.fillText('تطبيق القرآن الكريم', W / 2, H - 100);

  return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/png', 0.95));
};

export const shareAyahAsImage = async (input: AyahShareInput): Promise<boolean> => {
  const blob = await generateAyahImage(input);
  if (!blob) return false;
  const file = new File([blob], `ayah-${input.ayahNumber}.png`, { type: 'image/png' });

  // Try Web Share with files
  // @ts-ignore
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${input.surahName} - آية ${input.ayahNumber}`,
        text: input.text,
      });
      return true;
    } catch {
      /* user cancelled */
      return false;
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ayah-${input.surahName}-${input.ayahNumber}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
