FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy && go build -o engine .

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/engine .
CMD ["./engine"]
