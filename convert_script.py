import imageio.v3 as iio
import sys

print("Reading webp...")
try:
    frames = iio.imread('/Users/nsrr/.gemini/antigravity/brain/28ae2638-e6cd-42ca-bf9f-b47097ce1b8a/coreveta_dashboard_features_recording_1775785126901.webp', extension='.webp')
    print("Writing mp4...")
    iio.imwrite('/Users/nsrr/.gemini/antigravity/brain/28ae2638-e6cd-42ca-bf9f-b47097ce1b8a/coreveta_dashboard_features_recording.mp4', frames, extension='.mp4', fps=10)
    print("Done!")
except Exception as e:
    print("Error:", e)
    sys.exit(1)
