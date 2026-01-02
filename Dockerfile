FROM n8nio/n8n:latest

# Set working directory
WORKDIR /home/node/

# Switch to node user
USER node

# Expose n8n port
EXPOSE 5678

# Start n8n
CMD ["n8n", "start"]
