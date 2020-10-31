import AWS from 'aws-sdk'
import { Handler } from 'aws-lambda'
import wrap from '@dazn/lambda-powertools-pattern-basic'
import { execSync } from 'child_process'
import { readFileSync, unlinkSync } from 'fs'

const s3 = new AWS.S3()
// const DDB = new AWS.DynamoDB.DocumentClient()

export const handle = wrap<Handler>(async () => {
  const segmentData = {
    id: '00001',
    jobId: 'cdb3dc29-32a7-4d96-b8a8-f32e32b97e61',
    startTime: 4.167,
    endTime: 8.333,
    status: 'pending',
    createdAt: Date.now(),
    completedAt: null
  }

  const inputObjectURL = await s3.getSignedUrlPromise('getObject', {
    Bucket: 'nivo-uploads',
    Key: 'video.mkv',
    Expires: 60 * 5
  })

  const outputPath = `/tmp/${segmentData.jobId}-${segmentData.id}-transcoded.mp4`

  const createSegmentArguments = [
    `-i "${inputObjectURL}"`,
    '-s 1920x1080',
    '-ss',
    segmentData.startTime,
    '-to',
    segmentData.endTime,
    '-vcodec libx264',
    '-acodec copy',
    '-c:a aac',
    '-ar 48000',
    '-b:a 192k',
    '-c:v h264',
    '-profile:v main',
    '-crf 20',
    '-b:v 4000k',
    '-maxrate 4200k',
    '-bufsize 7500k',
    '-sc_threshold 0',
    '-keyint_min 48',
    '-muxdelay 0',
    outputPath
  ].join(' ')

  execSync(`/opt/ffmpeg ${createSegmentArguments}`)

  const transcodedVideo = readFileSync(outputPath)

  unlinkSync(outputPath)

  await s3
    .putObject({
      Bucket: 'nivo-segments',
      Key: `${segmentData.jobId}/${segmentData.id}.mp4`,
      Body: transcodedVideo
    })
    .promise()
})
