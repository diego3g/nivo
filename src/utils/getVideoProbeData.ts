import fs, { unlinkSync } from 'fs'
import { execSync } from 'child_process'

export interface Packet {
  pts_time: string
  pos: string
  flags: string
}

export interface Disposition {
  default: number
  dub: number
  original: number
  comment: number
  lyrics: number
  karaoke: number
  forced: number
  hearing_impaired: number
  visual_impaired: number
  clean_effects: number
  attached_pic: number
  timed_thumbnails: number
}

export interface Tags {
  DURATION: string
}

export interface Stream {
  index: number
  codec_name: string
  codec_long_name: string
  profile: string
  codec_type: string
  codec_time_base: string
  codec_tag_string: string
  codec_tag: string
  width: number
  height: number
  coded_width: number
  coded_height: number
  closed_captions: number
  has_b_frames: number
  sample_aspect_ratio: string
  display_aspect_ratio: string
  pix_fmt: string
  level: number
  color_range: string
  color_space: string
  color_transfer: string
  color_primaries: string
  chroma_location: string
  field_order: string
  refs: number
  is_avc: string
  nal_length_size: string
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
  bits_per_raw_sample: string
  nb_read_packets: string
  disposition: Disposition
  tags: Tags
}

export interface Tags2 {
  ENCODER: string
}

export interface Format {
  filename: string
  nb_streams: number
  nb_programs: number
  format_name: string
  format_long_name: string
  start_time: string
  duration: string
  size: string
  bit_rate: string
  probe_score: number
  tags: Tags2
}

export interface VideoInformation {
  packets: Packet[]
  programs: any[]
  streams: Stream[]
  format: Format
}

const probeVideoDataPath = '/tmp/probeData.json'

export async function getVideoProbeData(
  inputUrl: string
): Promise<VideoInformation> {
  const probeArguments = [
    '-v error',
    '-show_entries stream=width,height',
    '-show_entries format=size,duration',
    '-show_entries packet=pos,pts_time,flags',
    '-select_streams v',
    '-of compact=p=0:nk=1',
    '-show_format',
    '-show_streams',
    '-print_format json',
    `-i "${inputUrl}"`,
    `> "${probeVideoDataPath}"`
  ].join(' ')

  const command = `/opt/ffprobe ${probeArguments}`

  execSync(command)

  const probeData = await fs.promises.readFile(probeVideoDataPath)

  const data = JSON.parse(probeData.toString())

  unlinkSync(probeVideoDataPath)

  return data
}
