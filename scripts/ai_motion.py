#!/usr/bin/env python3
"""
Generate a looping video with moving regions from a still image.

This script follows the "AI-makes-it-move" recipe using
Segment-Anything for automatic masking and Stable Video Diffusion
for motion generation.  Only pixels inside the mask are animated;
all other pixels remain static so the result can be composited over
the original image without affecting existing 3D/VR pipelines like
Tiefling.

Usage:
    python scripts/ai_motion.py --image waterfall.jpg --sam-checkpoint sam_vit_h.pth \
        --svd-model stabilityai/stable-video-diffusion-img2vid-xt-1-1

The resulting looping video is written to `output.mp4` in the
current directory.  Adjust arguments as needed for your assets.
"""
import argparse
import cv2
import numpy as np
import torch
from diffusers import StableVideoDiffusionPipeline
from diffusers.utils import export_to_video
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

def generate_mask(image_path: str, sam_checkpoint: str, device: str) -> np.ndarray:
    """Return a binary mask of the largest segment in the image."""
    img = cv2.imread(image_path)[:, :, ::-1]  # BGR -> RGB
    sam = sam_model_registry["vit_h"](checkpoint=sam_checkpoint).to(device)
    mask_gen = SamAutomaticMaskGenerator(sam, points_per_side=64)
    masks = mask_gen.generate(img)
    # pick the largest mask by area
    mask = max(masks, key=lambda m: m["area"])['segmentation'].astype(np.uint8) * 255
    return img, mask

def generate_motion(img: np.ndarray, mask: np.ndarray, model: str, device: str,
                    num_frames: int, motion_bucket: int, noise_aug: float,
                    fps: int, output: str) -> None:
    """Generate motion inside the mask using Stable Video Diffusion."""
    h, w = 576, 1024  # native resolution of SVD-XT
    img_resized = cv2.resize(img, (w, h))
    mask_resized = cv2.resize(mask, (w, h)) > 0

    # compose conditioning image: keep original inside mask, grey outside
    cond = img_resized.copy()
    cond[~mask_resized] = 127

    pipe = StableVideoDiffusionPipeline.from_pretrained(
        model, torch_dtype=torch.float16, variant="fp16").to(device)
    pipe.enable_model_cpu_offload()

    frames = pipe(
        image=cond,
        num_frames=num_frames,
        motion_bucket_id=motion_bucket,
        noise_aug_strength=noise_aug,
    ).frames[0]

    out_frames = []
    for frame in frames:
        f = np.array(frame)  # PIL -> numpy
        composite = img_resized.copy()
        composite[mask_resized] = f[mask_resized]
        out_frames.append(composite)

    export_to_video(out_frames, output, fps=fps)

def main() -> None:
    parser = argparse.ArgumentParser(description="Animate masked regions in an image")
    parser.add_argument("--image", required=True, help="Path to source image")
    parser.add_argument("--sam-checkpoint", required=True, help="Path to SAM checkpoint")
    parser.add_argument("--svd-model", default="stabilityai/stable-video-diffusion-img2vid-xt-1-1",
                        help="Model id for Stable Video Diffusion")
    parser.add_argument("--device", default="cuda", help="Torch device")
    parser.add_argument("--num-frames", type=int, default=25, help="Number of frames to generate")
    parser.add_argument("--motion-bucket", type=int, default=160, help="Motion bucket id")
    parser.add_argument("--noise-aug", type=float, default=0.05, help="Noise augmentation strength")
    parser.add_argument("--fps", type=int, default=15, help="Frames per second for output video")
    parser.add_argument("--output", default="output.mp4", help="Path to output video")
    args = parser.parse_args()

    img, mask = generate_mask(args.image, args.sam_checkpoint, args.device)
    generate_motion(img, mask, args.svd_model, args.device, args.num_frames,
                    args.motion_bucket, args.noise_aug, args.fps, args.output)

if __name__ == "__main__":
    main()
