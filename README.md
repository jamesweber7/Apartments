# Welcome to Apartments!
This is a little project I did back in June 2021, and recently took out and added a couple features to.

Click on a window and its occupants will turn the light on or off. You can also type text or upload an image.

Check it out: [Apartments hosted by Amplify](https://master.d23l8orkgbv08u.amplifyapp.com/)

I also ran Bad Apple!! on it.
[![YouTube video of Bad Apple!! on Apartments](assets/Bad_Apple_Embed.png)](https://www.youtube.com/watch?v=UKjWc4tRXJ4)

# Bad Apple Branch:
This branch contains the code to play <i>Bad Apple!!</i> or another video on the apartment windows.

To play a video, add a folder with an image for each frame in your video, and configure the variables at the top of [sketch.js](sketch.js).

Then, open [index.html](index.html) in your browser and press 'Get Started!'

Runs about 85 frames per minute. You can exit out or refresh to stop running at any time, and modify ```videoFrameCount``` in [sketch.js](sketch.js) to begin running again.

### Stopping and Restarting

Stopping and starting again are easy, but there are some things you need to be aware of. First, beware that files can save achronologically, so after stopping you may have file_501, file_502, and file_504, but not file_503. Additionally, the canvas starts blank, and may take a few frames to look how it was in the middle of running. Also, refreshing will re-randomize the types of windows, meaning where there once was a window with lamps, there now may be a window with curtains. Finally, you should make sure that you don't change the size of the browser window between stopping and starting.

Navigating these issues isn't too bad. If you have your browser window taking up a weird size, make sure you remember exactly what size it is. Second, I delete the last 10 frames before stopping, and I put the ```videoFrameCount``` at about 10 frames less than that, and that is more than overkill to fix any holes in the saved file names and let the windows start up properly. Then, I go into my file explorer and delete duplicates. These are given (1) after the original filename on Windows.

As for re-randomizing the types of windows, it's not really noticable. When recording Bad Apple, I stopped and restarted twice, and I haven't found where the first time was. The second time I restarted was on a blank screen, and that's more noticeable but still not very noticeable at all. So I'd recommend restarting on a frame where a lot of movement occurs and not restarting on a blank screen, but NBD if you do.

If re-randomizing the windows is a huge issue for you, you'd have to go in and change my randomization algorithm in order to fix that. 

### I want to run <i>Bad Apple!!</i>
To run <i>Bad Apple!!</i> how I did, I downloaded the frames from the [Internet Archive (https://archive.org/details/bad_apple_is.7z)](https://archive.org/details/bad_apple_is.7z) and unzipped them into a folder called 'bad_apple_images' inside the project folder. Everything should be configured for you to record Bad Apple if you do this, without needing to modify sketch.js.

It took me approximately 75 minutes to run.