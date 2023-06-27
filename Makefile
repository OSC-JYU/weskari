IMAGES := $(shell docker images -f "dangling=true" -q)
CONTAINERS := $(shell docker ps -a -q -f status=exited)
VOLUME := weskari-data
VERSION := 1.2beta3


clean:
	docker rm -f $(CONTAINERS)
	docker rmi -f $(IMAGES)

create_volume:
	docker volume create $(VOLUME)

build:
	docker build -t osc.repo.kopla.jyu.fi/arihayri/weskari:$(VERSION) .



start:
	docker run -d --name weskari-api \
		-v $(VOLUME):/logs \
		-p 8080:8080 \
		-e PORT=8080 \
		-e DB=remote \
		-e DB_NAME="weskari" \
		-e DB_USER="weskari_user" \
		-e DB_PASSWORD="" \
		-e DB_URL="" \
		-e MS_CLIENT_ID="" \
		-e MS_CLIENT_SECRET="" \
		--network weskari-net \
		--network-alias weskari \
		--restart unless-stopped \
		osc.repo.kopla.jyu.fi/arihayri/weskari:$(VERSION)
restart:
	docker stop weskari-api
	docker rm weskari-api
	$(MAKE) start

bash:
	docker exec -it weskari-api bash
