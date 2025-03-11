import { AttachmentBuilder, type Message } from 'discord.js';
import sharp from 'sharp';

interface AttachmentType {
    name: string;
    type: string;
    url: string;
    source?: string;
}

export const getImages = (message: Message) => {
    const attachments = message.attachments
        .filter(
            (attach) =>
                attach.contentType?.startsWith('image/') ||
                /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(attach.name)
        )
        .map(
            (v) =>
                ({
                    name: v.name,
                    type: 'attachment',
                    url: v.url,
                    source: 'image'
                }) as AttachmentType
        );
    const otherAttachments = new Array<AttachmentType>();

    (message.embeds ?? []).map((embed) => {
        if (embed.image) {
            otherAttachments.push({
                name: Math.random().toString(36).substring(7),
                type: 'embed-image',
                url: embed.image.url,
                source: 'image'
            });
        }

        // Check for thumbnail in embed
        if (embed.thumbnail) {
            otherAttachments.push({
                name: Math.random().toString(36).substring(7),
                type: 'embed-thumbnail',
                url: embed.thumbnail.url,
                source: 'thumbnail'
            });
        }
    });

    return attachments.concat(otherAttachments);
};

export const fetchImage = async (img: string) => {
    const fetched = await fetch(img);
    const imgBlob = fetched.ok ? await fetched.blob() : null;

    if (!imgBlob) return;

    return {
        getBuffer: async () => Buffer.from(await imgBlob.arrayBuffer()),
        blob: imgBlob
    };
};

export const rotate = async (img: AttachmentType, angle: number) => {
    const fetched = await fetchImage(img.url);
    if (!fetched) return;

    const rotated = await sharp(await fetched.getBuffer())
        .rotate(angle)
        .toBuffer();

    return new AttachmentBuilder(rotated, {
        name: 'rotated.png'
    });
};
