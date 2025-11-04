import os
import shutil
import subprocess
import re
from pathlib import Path

from config import FFMPEG_PATH


DEFAULT_FFMPEG_NAME = "ffmpeg.exe" if os.name == "nt" else "ffmpeg"


def _resolve_ffmpeg_bin() -> str:
    if FFMPEG_PATH:
        candidate = Path(FFMPEG_PATH)
        if candidate.is_dir():
            executable = candidate / DEFAULT_FFMPEG_NAME
            if executable.is_file():
                return str(executable)
        elif candidate.is_file():
            return str(candidate)

    discovered = shutil.which("ffmpeg")
    if discovered:
        return discovered

    return DEFAULT_FFMPEG_NAME


FFMPEG_BIN = _resolve_ffmpeg_bin()


def _prepare_ffmpeg_cmd(cmd):
    resolved = list(cmd)
    if not resolved:
        raise ValueError("FFmpeg command cannot be empty")
    resolved[0] = FFMPEG_BIN
    return [str(part) for part in resolved]


def run_ffmpeg_command(cmd):
    return subprocess.run(_prepare_ffmpeg_cmd(cmd), check=True, capture_output=True)


def safe_filename(name):
    # Replace unsafe chars with underscore
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', name)


def ffmpeg_trim(input_path, output_path, seconds):
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure destination directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(seconds),
        "-i", str(input_path),
        "-c", "copy",  # Copy both video and audio without re-encoding
        str(output_path)
    ]
    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_contrast(input_path, output_path, value):
    """Adjust video contrast using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Convert value to contrast filter format (1.0 = normal, 0.5 = less contrast, 2.0 = more contrast)
    contrast_factor = 1 + (value / 100.0)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"eq=contrast={contrast_factor}",  # Video filter for contrast
        "-c:a", "copy",  # Copy audio without re-encoding
        "-c:v", "libx264",  # Re-encode video with adjustments
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg contrast adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_brightness(input_path, output_path, value):
    """Adjust video brightness using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Convert value to brightness filter format
    brightness_value = value / 100.0  # Normalize value

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        # Video filter for brightness
        "-vf", f"eq=brightness={brightness_value}",
        "-c:a", "copy",  # Copy audio without re-encoding
        "-c:v", "libx264",  # Re-encode video with adjustments
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg brightness adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_saturation(input_path, output_path, value):
    """Adjust video saturation using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Convert value to saturation filter format (1.0 = normal, 0.5 = less saturated, 2.0 = more saturated)
    saturation_factor = 1 + (value / 100.0)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"eq=saturation={saturation_factor}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg saturation adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_hue(input_path, output_path, value):
    """Adjust video hue using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Hue adjustment in degrees (-180 to 180)
    hue_degrees = value

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"hue=h={hue_degrees}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg hue adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_gamma(input_path, output_path, value):
    """Adjust video gamma using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Gamma adjustment (1.0 = normal, 0.5 = darker, 2.0 = brighter)
    gamma_value = 1 + (value / 100.0)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"eq=gamma={gamma_value}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg gamma adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_apply_blur(input_path, output_path, value):
    """Apply blur effect to video using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Blur radius (1-10 typical range)
    blur_radius = max(1, min(10, value))

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"boxblur={blur_radius}:{blur_radius}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg blur effect error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_apply_sharpen(input_path, output_path, value):
    """Apply sharpen effect to video using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Sharpen intensity (0.1 to 2.0)
    sharpen_intensity = max(0.1, min(2.0, value / 10.0))

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"unsharp=5:5:{sharpen_intensity}:5:5:{sharpen_intensity}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
    except subprocess.CalledProcessError as e:
        print("FFmpeg sharpen effect error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_speed(input_path, output_path, speed_factor):
    """Adjust video playback speed using FFmpeg while preserving audio pitch"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Speed factor (0.5 = half speed, 2.0 = double speed)
    speed = max(0.1, min(4.0, speed_factor))

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-filter_complex", f"[0:v]setpts={1/speed}*PTS[v];[0:a]atempo={speed}[a]",
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264",
        "-c:a", "aac",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Applied {speed}x speed adjustment")
    except subprocess.CalledProcessError as e:
        print("FFmpeg speed adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_rotate_video(input_path, output_path, degrees):
    """Rotate video by specified degrees using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Convert degrees to radians for FFmpeg
    import math
    radians = math.radians(degrees % 360)

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"rotate={radians}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Rotated video by {degrees} degrees")
    except subprocess.CalledProcessError as e:
        print("FFmpeg rotation error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_flip_video(input_path, output_path, direction):
    """Flip video horizontally or vertically using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Determine flip filter
    if direction.lower() in ["horizontal", "h"]:
        flip_filter = "hflip"
    elif direction.lower() in ["vertical", "v"]:
        flip_filter = "vflip"
    else:
        raise ValueError("Direction must be 'horizontal' or 'vertical'")

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", flip_filter,
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Flipped video {direction}")
    except subprocess.CalledProcessError as e:
        print("FFmpeg flip error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_crop_video(input_path, output_path, x, y, width, height):
    """Crop video to specified dimensions using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", f"crop={width}:{height}:{x}:{y}",
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Cropped video to {width}x{height} at ({x},{y})")
    except subprocess.CalledProcessError as e:
        print("FFmpeg crop error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_scale_video(input_path, output_path, width, height):
    """Scale/resize video to specified dimensions using FFmpeg while preserving audio"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Handle aspect ratio preservation
    scale_filter = f"scale={width}:{height}"
    if width == -1 or height == -1:
        scale_filter = f"scale={width}:{height}"  # -1 maintains aspect ratio

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-vf", scale_filter,
        "-c:a", "copy",
        "-c:v", "libx264",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Scaled video to {width}x{height}")
    except subprocess.CalledProcessError as e:
        print("FFmpeg scale error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def ffmpeg_adjust_volume(input_path, output_path, volume_db):
    """Adjust audio volume using FFmpeg while preserving video"""
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_path),
        "-af", f"volume={volume_db}dB",
        "-c:v", "copy",
        "-c:a", "aac",
        str(output_path)
    ]

    try:
        run_ffmpeg_command(cmd)
        print(f"✅ Adjusted volume by {volume_db}dB")
    except subprocess.CalledProcessError as e:
        print("FFmpeg volume adjustment error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    return str(output_path)


def validate_audio_present(video_path):
    """Check if video file contains audio track"""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-select_streams", "a:0",
        "-show_entries", "stream=codec_name",
        "-of", "csv=p=0",
        str(video_path)
    ]

    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=True)
        return bool(result.stdout.strip())
    except subprocess.CalledProcessError:
        return False
    except FileNotFoundError:
        print("⚠️  FFprobe not found - cannot validate audio. Please install FFmpeg.")
        print("   Download from: https://ffmpeg.org/download.html")
        return True  # Assume audio present to avoid blocking processing


def ffmpeg_cut_section(input_path, output_path, start_time, end_time):
    """
    Cut out a section from the middle of a video and rejoin the remaining parts.

    Example: For a 3-minute video, cut from 2:00 to 2:30 (removes 30 seconds from middle)

    Args:
        input_path: Path to input video
        output_path: Path for output video
        start_time: Start time of section to cut (in seconds)
        end_time: End time of section to cut (in seconds)

    Returns:
        Path to the output video
    """
    input_path = Path(input_path)
    output_path = Path(output_path)

    # Ensure old file removed
    if output_path.exists():
        output_path.unlink()

    # Create temporary directory for intermediate files
    temp_dir = output_path.parent / "temp_cut"
    temp_dir.mkdir(exist_ok=True)

    # File paths for the two segments
    part1_path = temp_dir / f"part1_{input_path.stem}.mp4"
    part2_path = temp_dir / f"part2_{input_path.stem}.mp4"
    concat_list_path = temp_dir / "concat_list.txt"

    try:
        # Step 1: Extract first part (0 to start_time)
        print(f"📹 Extracting first part: 0 to {start_time}s")
        cmd1 = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-t", str(start_time),  # Duration from beginning
            "-c", "copy",  # Copy without re-encoding to preserve quality
            str(part1_path)
        ]

        run_ffmpeg_command(cmd1)

        # Step 2: Extract second part (end_time to end of video)
        print(f"📹 Extracting second part: {end_time}s to end")
        cmd2 = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-ss", str(end_time),  # Start from end_time
            "-c", "copy",  # Copy without re-encoding
            str(part2_path)
        ]

        run_ffmpeg_command(cmd2)

        # Step 3: Create concat list file for FFmpeg
        with open(concat_list_path, 'w') as f:
            f.write(f"file '{part1_path.absolute()}'\n")
            f.write(f"file '{part2_path.absolute()}'\n")

        # Step 4: Concatenate the two parts
        print(f"🔗 Joining parts together")
        cmd3 = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_list_path),
            "-c", "copy",  # Copy to preserve quality and audio
            str(output_path)
        ]

        run_ffmpeg_command(cmd3)

        print(
            f"✅ Successfully cut section {start_time}s-{end_time}s from video")

    except subprocess.CalledProcessError as e:
        print("FFmpeg cut section error:", e.stderr.decode())
        raise
    except FileNotFoundError:
        raise Exception(
            "FFmpeg not found! Please install FFmpeg and add it to your system PATH.\nDownload from: https://ffmpeg.org/download.html")

    finally:
        # Cleanup temporary files
        for temp_file in [part1_path, part2_path, concat_list_path]:
            if temp_file.exists():
                try:
                    temp_file.unlink()
                except:
                    pass

        # Remove temp directory if empty
        try:
            temp_dir.rmdir()
        except:
            pass

    return str(output_path)


def get_video_duration(video_path):
    """Get the duration of a video in seconds"""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(video_path)
    ]

    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        return None
    except FileNotFoundError:
        print("⚠️  FFprobe not found - cannot get video duration.")
        return None
