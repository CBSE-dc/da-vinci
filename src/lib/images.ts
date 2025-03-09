import { AttachmentBuilder, type Message } from 'discord.js';
import sharp from 'sharp';

interface AttachmentType {
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
                    type: 'attachment',
                    url: v.url,
                    source: 'image'
                }) as AttachmentType
        );
    const otherAttachments = new Array<AttachmentType>();

    message.embeds.map((embed) => {
        if (embed.image) {
            otherAttachments.push({
                type: 'embed-image',
                url: embed.image.url,
                source: 'image'
            });
        }

        // Check for thumbnail in embed
        if (embed.thumbnail) {
            otherAttachments.push({
                type: 'embed-thumbnail',
                url: embed.thumbnail.url,
                source: 'thumbnail'
            });
        }
    });

    return attachments.concat(otherAttachments);
};

export const rotate = async (img: AttachmentType, angle: number) => {
    const fetched = await fetch(img.url);
    const imgBlob = fetched.ok ? await fetched.blob() : null;

    if (!imgBlob) return;

    const buffer = Buffer.from(await imgBlob.arrayBuffer());
    const rotated = await sharp(buffer).rotate(angle).toBuffer();

    return new AttachmentBuilder(rotated, {
        name: 'rotated.png'
    });
};
