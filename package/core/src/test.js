import { execFile } from 'child_process'

execFile(
  'E:/水科院/SkySystem/GISApplicationFrame.exe',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
  },
)
