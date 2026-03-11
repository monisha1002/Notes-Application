# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Install any needed packages specified in requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Set GOOGLE_APPLICATION_CREDENTIALS environment variable
# This assumes your service account key file will be mounted into the container
# For example: docker run -v /path/to/your/key.json:/app/key.json -e GOOGLE_APPLICATION_CREDENTIALS=/app/key.json your-image
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/key.json

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run gunicorn to serve the Flask application
# Use 0.0.0.0 to make it accessible from outside the container
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
