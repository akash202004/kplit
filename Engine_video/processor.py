import subprocess
import os
from pathlib import Path
from ffmpeg_utils import (
    ffmpeg_trim, ffmpeg_adjust_contrast, ffmpeg_adjust_brightness,
    validate_audio_present, ffmpeg_cut_section, get_video_duration,
    ffmpeg_adjust_saturation, ffmpeg_adjust_hue, ffmpeg_adjust_gamma,
    ffmpeg_apply_blur, ffmpeg_apply_sharpen, ffmpeg_adjust_speed,
    ffmpeg_rotate_video, ffmpeg_flip_video, ffmpeg_crop_video,
    ffmpeg_scale_video, ffmpeg_adjust_volume
)


def process_video(input_path, actions, output_path):
    """Process video with multiple actions while preserving audio throughout"""

    # Validate input has audio
    input_has_audio = validate_audio_present(input_path)
    print(
        f"Input video audio status: {'Present' if input_has_audio else 'Not present'}")

    temp_path = input_path
    temp_files = []  # Track temporary files for cleanup

    try:
        for i, act in enumerate(actions.get("actions", [])):
            action = act.get("action", "")
            value = act.get("value", 0)  # Default to 0 if no value provided
            unit = act.get("unit", "")

            # Create unique temporary filename for each step
            temp_output = None
            if i < len(actions.get("actions", [])) - 1:  # Not the last action
                temp_dir = Path(output_path).parent
                temp_output = temp_dir / \
                    f"temp_step_{i}_{Path(input_path).stem}.mp4"
                temp_files.append(str(temp_output))
            else:
                temp_output = output_path

            print(f"Processing action: {action} with value: {value}")

            if action == "trim":
                temp_path = ffmpeg_trim(temp_path, str(temp_output), value)

            elif action == "adjust_contrast":
                temp_path = ffmpeg_adjust_contrast(
                    temp_path, str(temp_output), value)

            elif action == "brightness":
                temp_path = ffmpeg_adjust_brightness(
                    temp_path, str(temp_output), value)

            elif action == "saturation":
                temp_path = ffmpeg_adjust_saturation(
                    temp_path, str(temp_output), value)

            elif action == "hue":
                temp_path = ffmpeg_adjust_hue(
                    temp_path, str(temp_output), value)

            elif action == "gamma":
                temp_path = ffmpeg_adjust_gamma(
                    temp_path, str(temp_output), value)

            elif action == "blur":
                temp_path = ffmpeg_apply_blur(
                    temp_path, str(temp_output), value)

            elif action == "sharpen":
                temp_path = ffmpeg_apply_sharpen(
                    temp_path, str(temp_output), value)

            elif action == "speed":
                temp_path = ffmpeg_adjust_speed(
                    temp_path, str(temp_output), value)

            elif action == "rotate":
                temp_path = ffmpeg_rotate_video(
                    temp_path, str(temp_output), value)

            elif action == "flip":
                direction = act.get("direction", "horizontal")
                temp_path = ffmpeg_flip_video(
                    temp_path, str(temp_output), direction)

            elif action == "crop":
                x = act.get("x", 0)
                y = act.get("y", 0)
                width = act.get("width", 640)
                height = act.get("height", 480)
                temp_path = ffmpeg_crop_video(
                    temp_path, str(temp_output), x, y, width, height)

            elif action == "scale":
                width = act.get("width", 1920)
                height = act.get("height", 1080)
                temp_path = ffmpeg_scale_video(
                    temp_path, str(temp_output), width, height)

            elif action == "volume":
                temp_path = ffmpeg_adjust_volume(
                    temp_path, str(temp_output), value)

            elif action == "cut_section":
                # For cut_section, start_time and end_time are required
                start_time = act.get("start_time")
                end_time = act.get("end_time")

                if start_time is None or end_time is None:
                    print(f"❌ cut_section requires both start_time and end_time")
                    print(
                        f"   Received: start_time={start_time}, end_time={end_time}")
                    continue

                temp_path = ffmpeg_cut_section(
                    temp_path, str(temp_output), start_time, end_time)

            else:
                print(f"Unknown action: {action}")
                continue

            # Verify audio is still present after each step
            if input_has_audio:
                audio_present = validate_audio_present(temp_path)
                print(
                    f"After {action}: Audio {'preserved' if audio_present else 'LOST!'}")

    except KeyError as e:
        print(f"Missing required field in action: {e}")
        print(f"Action received: {act}")
        raise Exception(f"Invalid action format: missing {e}")
    except Exception as e:
        print(f"Error during video processing: {e}")
        # Cleanup temporary files on error
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        raise

    finally:
        # Cleanup temporary files
        for temp_file in temp_files:
            if os.path.exists(temp_file) and temp_file != temp_path:
                try:
                    os.remove(temp_file)
                except:
                    pass  # Ignore cleanup errors

    # Final validation
    if input_has_audio:
        final_audio = validate_audio_present(output_path)
        print(
            f"Final output audio status: {'Present' if final_audio else 'MISSING!'}")

        if not final_audio:
            print("WARNING: Audio was lost during processing!")

    return output_path
