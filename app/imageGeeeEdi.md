Create image edit
post
 
https://api.openai.com/v1/images/edits
Creates an edited or extended image given one or more source images and a prompt. This endpoint only supports gpt-image-1 and dall-e-2.

Request body
image
string or array

Required
The image(s) to edit. Must be a supported image file or an array of images.

For gpt-image-1, each image should be a png, webp, or jpg file less than 50MB. You can provide up to 16 images.

For dall-e-2, you can only provide one image, and it should be a square png file less than 4MB.

prompt
string

Required
A text description of the desired image(s). The maximum length is 1000 characters for dall-e-2, and 32000 characters for gpt-image-1.

background
string or null

Optional
Defaults to auto
Allows to set transparency for the background of the generated image(s). This parameter is only supported for gpt-image-1. Must be one of transparent, opaque or auto (default value). When auto is used, the model will automatically determine the best background for the image.

If transparent, the output format needs to support transparency, so it should be set to either png (default value) or webp.

input_fidelity
string or null

Optional
Defaults to low
Control how much effort the model will exert to match the style and features, especially facial features, of input images. This parameter is only supported for gpt-image-1. Supports high and low. Defaults to low.

mask
file

Optional
An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where image should be edited. If there are multiple images provided, the mask will be applied on the first image. Must be a valid PNG file, less than 4MB, and have the same dimensions as image.

model
string

Optional
Defaults to dall-e-2
The model to use for image generation. Only dall-e-2 and gpt-image-1 are supported. Defaults to dall-e-2 unless a parameter specific to gpt-image-1 is used.

n
integer or null

Optional
Defaults to 1
The number of images to generate. Must be between 1 and 10.

output_compression
integer or null

Optional
Defaults to 100
The compression level (0-100%) for the generated images. This parameter is only supported for gpt-image-1 with the webp or jpeg output formats, and defaults to 100.

output_format
string or null

Optional
Defaults to png
The format in which the generated images are returned. This parameter is only supported for gpt-image-1. Must be one of png, jpeg, or webp. The default value is png.

partial_images
integer or null

Optional
Defaults to 0
The number of partial images to generate. This parameter is used for streaming responses that return partial images. Value must be between 0 and 3. When set to 0, the response will be a single image sent in one streaming event.

Note that the final image may be sent before the full number of partial images are generated if the full image is generated more quickly.

quality
string or null

Optional
Defaults to auto
The quality of the image that will be generated. high, medium and low are only supported for gpt-image-1. dall-e-2 only supports standard quality. Defaults to auto.

response_format
string or null

Optional
Defaults to url
The format in which the generated images are returned. Must be one of url or b64_json. URLs are only valid for 60 minutes after the image has been generated. This parameter is only supported for dall-e-2, as gpt-image-1 will always return base64-encoded images.

size
string or null

Optional
Defaults to 1024x1024
The size of the generated images. Must be one of 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait), or auto (default value) for gpt-image-1, and one of 256x256, 512x512, or 1024x1024 for dall-e-2.

stream
boolean or null

Optional
Defaults to false
Edit the image in streaming mode. Defaults to false. See the Image generation guide for more information.

user
string

Optional
A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. Learn more.

Returns
Returns an image object.

Edit image
Streaming
Example request
curl -s -D >(grep -i x-request-id >&2) \
  -o >(jq -r '.data[0].b64_json' | base64 --decode > gift-basket.png) \
  -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=gpt-image-1" \
  -F "image[]=@body-lotion.png" \
  -F "image[]=@bath-bomb.png" \
  -F "image[]=@incense-kit.png" \
  -F "image[]=@soap.png" \
  -F 'prompt=Create a lovely gift basket with these four items in it'
Create image variation
post
 
https://api.openai.com/v1/images/variations
Creates a variation of a given image. This endpoint only supports dall-e-2.

Request body
image
file

Required
The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.

model
string or "dall-e-2"

Optional
Defaults to dall-e-2
The model to use for image generation. Only dall-e-2 is supported at this time.

n
integer or null

Optional
Defaults to 1
The number of images to generate. Must be between 1 and 10.

response_format
string or null

Optional
Defaults to url
The format in which the generated images are returned. Must be one of url or b64_json. URLs are only valid for 60 minutes after the image has been generated.

size
string or null

Optional
Defaults to 1024x1024
The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024.

user
string

Optional
A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. Learn more.

Returns
Returns a list of image objects.

Example request
curl https://api.openai.com/v1/images/variations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F image="@otter.png" \
  -F n=2 \
  -F size="1024x1024"
Response
{
  "created": 1589478378,
  "data": [
    {
      "url": "https://..."
    },
    {
      "url": "https://..."
    }
  ]
}
The image generation response
The response from the image generation endpoint.

background
string

The background parameter used for the image generation. Either transparent or opaque.

created
integer

The Unix timestamp (in seconds) of when the image was created.

data
array

The list of generated images.


Show properties
output_format
string

The output format of the image generation. Either png, webp, or jpeg.

quality
string

The quality of the image generated. Either low, medium, or high.

size
string

The size of the image generated. Either 1024x1024, 1024x1536, or 1536x1024.

usage
object

For gpt-image-1 only, the token usage information for the image generation.


Show properties
OBJECT The image generation response
{
  "created": 1713833628,
  "data": [
    {
      "b64_json": "..."
    }
  ],
  "background": "transparent",
  "output_format": "png",
  "size": "1024x1024",
  "quality": "high",
  "usage": {
    "total_tokens": 100,
    "input_tokens": 50,
    "output_tokens": 50,
    "input_tokens_details": {
      "text_tokens": 10,
      "image_tokens": 40
    }
  }
}
Image Streaming
Stream image generation and editing in real time with server-sent events. Learn more about image streaming.

image_generation.partial_image
Emitted when a partial image is available during image generation streaming.

b64_json
string

Base64-encoded partial image data, suitable for rendering as an image.

background
string

The background setting for the requested image.

created_at
integer

The Unix timestamp when the event was created.

output_format
string

The output format for the requested image.

partial_image_index
integer

0-based index for the partial image (streaming).

quality
string

The quality setting for the requested image.

size
string

The size of the requested image.

type
string

The type of the event. Always image_generation.partial_image.

OBJECT image_generation.partial_image
{
  "type": "image_generation.partial_image",
  "b64_json": "...",
  "created_at": 1620000000,
  "size": "1024x1024",
  "quality": "high",
  "background": "transparent",
  "output_format": "png",
  "partial_image_index": 0
}
image_generation.completed
Emitted when image generation has completed and the final image is available.

b64_json
string

Base64-encoded image data, suitable for rendering as an image.

background
string

The background setting for the generated image.

created_at
integer

The Unix timestamp when the event was created.

output_format
string

The output format for the generated image.

quality
string

The quality setting for the generated image.

size
string

The size of the generated image.

type
string

The type of the event. Always image_generation.completed.

usage
object

For gpt-image-1 only, the token usage information for the image generation.


Show properties
OBJECT image_generation.completed
{
  "type": "image_generation.completed",
  "b64_json": "...",
  "created_at": 1620000000,
  "size": "1024x1024",
  "quality": "high",
  "background": "transparent",
  "output_format": "png",
  "usage": {
    "total_tokens": 100,
    "input_tokens": 50,
    "output_tokens": 50,
    "input_tokens_details": {
      "text_tokens": 10,
      "image_tokens": 40
    }
  }
}
image_edit.partial_image
Emitted when a partial image is available during image editing streaming.

b64_json
string

Base64-encoded partial image data, suitable for rendering as an image.

background
string

The background setting for the requested edited image.

created_at
integer

The Unix timestamp when the event was created.

output_format
string

The output format for the requested edited image.

partial_image_index
integer

0-based index for the partial image (streaming).

quality
string

The quality setting for the requested edited image.

size
string

The size of the requested edited image.

type
string

The type of the event. Always image_edit.partial_image.

OBJECT image_edit.partial_image
{
  "type": "image_edit.partial_image",
  "b64_json": "...",
  "created_at": 1620000000,
  "size": "1024x1024",
  "quality": "high",
  "background": "transparent",
  "output_format": "png",
  "partial_image_index": 0
}
image_edit.completed
Emitted when image editing has completed and the final image is available.

b64_json
string

Base64-encoded final edited image data, suitable for rendering as an image.

background
string

The background setting for the edited image.

created_at
integer

The Unix timestamp when the event was created.

output_format
string

The output format for the edited image.

quality
string

The quality setting for the edited image.

size
string

The size of the edited image.

type
string

The type of the event. Always image_edit.completed.

usage
object

For gpt-image-1 only, the token usage information for the image generation.


Show properties
OBJECT image_edit.completed
{
  "type": "image_edit.completed",
  "b64_json": "...",
  "created_at": 1620000000,
  "size": "1024x1024",
  "quality": "high",
  "background": "transparent",
  "output_format": "png",
  "usage": {
    "total_tokens": 100,
    "input_tokens": 50,
    "output_tokens": 50,
    "input_tokens_details": {
      "text_tokens": 10,
      "image_tokens": 40
    }
  }
}