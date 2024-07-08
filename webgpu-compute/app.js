// Check for WebGPU support
if (!navigator.gpu) {
  console.log("WebGPU not supported");
} else {
  console.log("WebGPU is supported");
}

// Define the compute shader code in WGSL
const shaderCode = `
@group(0) @binding(0) var<storage, read_write> output: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id : vec3u) {
  if (global_id.x >= u32(output.length())) {
      return;
  }
  output[global_id.x] = (f32(global_id.x) +1) * 1000.0 + f32(global_id.x % 64);
}
`;

async function initWebGPU() {
  // Request a WebGPU adapter and device
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // Create a buffer to hold the output data
  const bufferSize = 64 * 1024; // 64 KB buffer
  const outputBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  // Create a buffer to read back the data
  const readBuffer = device.createBuffer({
      size: bufferSize,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  // Create a bind group layout and bind group
  const bindGroupLayout = device.createBindGroupLayout({
      entries: [{
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: 'storage' }
      }]
  });

  const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [{
          binding: 0,
          resource: { buffer: outputBuffer }
      }]
  });

  // Create a compute pipeline
  const pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      compute: {
          module: device.createShaderModule({ code: shaderCode }),
          entryPoint: "main"
      }
  });

  // Create a command encoder
  const commandEncoder = device.createCommandEncoder();

  // Encode the commands to dispatch the compute shader
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(1024, 1, 1); // Dispatch workgroups
  passEncoder.end();

  // Copy the output buffer to the read buffer
  commandEncoder.copyBufferToBuffer(outputBuffer, 0, readBuffer, 0, bufferSize);

  // Submit the commands
  device.queue.submit([commandEncoder.finish()]);

  // Map the read buffer to read back the data
  await readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuffer.getMappedRange();
  const outputData = new Float32Array(arrayBuffer);
  console.log(outputData);

  // Unmap the buffer
  readBuffer.unmap();
}

initWebGPU();
